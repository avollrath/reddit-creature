import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Creature } from "@/lib/creatures";

type CreatureCardCopy = {
  name: string;
  title: string;
  lore: string;
};

type CreatureCardCopyResult = {
  copy: CreatureCardCopy;
  source: "generated" | "fallback";
};

type ChatCompletionContentPart =
  | {
      type?: string;
      text?: string | null;
    }
  | string;

type ChatCompletionChoice = {
  message?: {
    content?: string | ChatCompletionContentPart[] | null;
    reasoning_content?: string | null;
    refusal?: string | null;
  };
  finish_reason?: string | null;
};

const TEXT_MODEL = process.env.POLLINATIONS_TEXT_MODEL || "gemini-fast";
const CHAT_TIMEOUT_MS = 10000;
const SIMPLE_TEXT_TIMEOUT_MS = 12000;
const COPY_CACHE_DIR = path.join(process.cwd(), ".cache", "creature-card-copy");
const CHAT_COMPLETIONS_ENDPOINT = "https://gen.pollinations.ai/v1/chat/completions";
const SIMPLE_TEXT_ENDPOINT = "https://gen.pollinations.ai/text";
const inFlightCopy = new Map<string, Promise<CreatureCardCopy>>();

function getApiKey() {
  return process.env.POLLINATIONS_API_KEY || null;
}

function buildPrompt(creature: Creature) {
  return [
    `Preferred player label: ${creature.displayName}`,
    `Username: ${creature.username}`,
    `Deterministic card name: ${creature.name}`,
    `Deterministic card title: ${creature.title}`,
    `Canonical archetype: ${creature.metadata.strongestModeLabel} ${creature.metadata.traitLabel}`,
    `Deterministic fallback lore seed: ${creature.description}`,
    `Rarity: ${creature.rarity}`,
    `Affinity: ${creature.metadata.affinity}`,
    `Trait label: ${creature.metadata.traitLabel}`,
    `Rarity accent: ${creature.rarityAccent}`,
    `Title badge: ${creature.metadata.titleBadge}`,
    `Strongest mode: ${creature.metadata.strongestModeLabel}`,
    `Derived stats: ${creature.stats.map((stat) => `${stat.label} ${stat.value}`).join(", ")}`,
    `Power score: ${creature.metadata.power}`,
    `Member since: ${creature.details.memberSince}`,
    `Signature: ${creature.details.signature}`,
    `Record: ${creature.details.record}`,
    `Profile source: ${creature.grounding.source}`,
    `Lookup state: ${creature.grounding.lookupState}`,
    `Account age years: ${creature.grounding.accountAgeYears ?? "unknown"}`,
    `Followers: ${creature.grounding.followers ?? "unknown"}`,
    `Chess title: ${creature.grounding.title ?? "none"}`,
    `Profile status: ${creature.grounding.status ?? "unknown"}`,
    `Country code: ${creature.grounding.countryCode ?? "unknown"}`,
    `Is streamer: ${creature.grounding.isStreamer}`,
    `Warnings: ${creature.grounding.warnings.join(" | ") || "none"}`,
  ].join(" ");
}

function createCacheKey(creature: Creature, prompt: string) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: 10,
        endpoint: "chat-completions+simple-text-fallback",
        username: creature.username,
        model: TEXT_MODEL,
        prompt,
      })
    )
    .digest("hex");
}

function getCacheFilePath(cacheKey: string) {
  return path.join(COPY_CACHE_DIR, `${cacheKey}.json`);
}

async function readFromCache(cacheKey: string) {
  try {
    const raw = await readFile(getCacheFilePath(cacheKey), "utf8");
    const parsed = JSON.parse(raw) as Partial<CreatureCardCopy>;

    if (
      typeof parsed.name === "string" &&
      parsed.name.trim() &&
      typeof parsed.title === "string" &&
      parsed.title.trim() &&
      typeof parsed.lore === "string" &&
      parsed.lore.trim()
    ) {
      return {
        name: parsed.name.trim(),
        title: parsed.title.trim(),
        lore: parsed.lore.trim(),
      } satisfies CreatureCardCopy;
    }

    return null;
  } catch {
    return null;
  }
}

async function writeToCache(cacheKey: string, copy: CreatureCardCopy) {
  try {
    await mkdir(COPY_CACHE_DIR, { recursive: true });
    await writeFile(getCacheFilePath(cacheKey), JSON.stringify(copy), "utf8");
  } catch {
    // Ignore cache write failures.
  }
}

function sanitizeText(value: string, fallback: string, maxLength: number) {
  const sanitized = value
    .replace(/^["'\s]+|["'\s]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!sanitized) {
    return fallback;
  }

  return sanitized.slice(0, maxLength).trim();
}

function getWordCount(value: string) {
  return value.split(/\s+/).filter(Boolean).length;
}

function normalizeForComparison(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function capitalizeSegment(value: string) {
  if (!value) {
    return value;
  }

  return value
    .split("'")
    .map((part, index) => {
      if (!part) {
        return part;
      }

      if (index > 0 && part.length <= 2) {
        return part.toLowerCase();
      }

      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join("'");
}

function capitalizeTitle(value: string) {
  return value
    .split(" ")
    .map((word) =>
      word.replace(
        /[A-Za-z0-9_]+(?:'[A-Za-z0-9_]+)*/g,
        (segment) => capitalizeSegment(segment)
      )
    )
    .join(" ");
}

function buildFallbackTitle(creature: Creature) {
  const baseTitle = creature.title.replace(/^The\s+/i, "");
  return `${creature.displayName}, ${baseTitle}`;
}

function escapeForRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function sanitizeTitle(value: string, creature: Creature) {
  const fallback = capitalizeTitle(buildFallbackTitle(creature));
  const sanitized = capitalizeTitle(sanitizeText(value, fallback, 64));
  const wordCount = getWordCount(sanitized);
  const normalizedTitle = normalizeForComparison(sanitized);
  const normalizedIdentity = normalizeForComparison(creature.displayName);
  const awkwardPattern = new RegExp(
    `\\bby\\s+${escapeForRegExp(creature.displayName)}\\b`,
    "i"
  );

  if (
    wordCount < 3 ||
    wordCount > 8 ||
    !normalizedIdentity ||
    !normalizedTitle.includes(normalizedIdentity) ||
    awkwardPattern.test(sanitized)
  ) {
    return fallback;
  }

  return sanitized;
}

function sanitizeSubtitle(value: string, creature: Creature) {
  const fallback = capitalizeTitle(creature.title);
  const sanitized = capitalizeTitle(sanitizeText(value, fallback, 44));
  const wordCount = getWordCount(sanitized);

  if (wordCount < 2 || wordCount > 6) {
    return fallback;
  }

  return sanitized;
}

function normalizeSpacing(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function trimToMaxLength(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const sliced = value.slice(0, maxLength);
  const lastSentenceBreak = Math.max(
    sliced.lastIndexOf(". "),
    sliced.lastIndexOf("! "),
    sliced.lastIndexOf("? ")
  );

  if (lastSentenceBreak >= 220) {
    return sliced.slice(0, lastSentenceBreak + 1).trim();
  }

  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, Math.max(lastSpace, 0)).trim()}.`;
}

function padLoreToMinimumLength(value: string, creature: Creature) {
  if (value.length >= 290) {
    return value;
  }

  const additions = [
    `${creature.displayName} fights with the discipline and presence expected from a ${creature.metadata.traitLabel.toLowerCase()}.`,
    `The ${creature.metadata.strongestModeLabel.toLowerCase()} focus makes the character feel dangerous, controlled, and built for direct confrontation.`,
    `The ${creature.rarity.toLowerCase()} finish gives the creature a polished battlefield presence without making the description overly ornate.`,
  ];

  let expanded = value;

  for (const addition of additions) {
    if (expanded.length >= 290) {
      break;
    }

    const candidate = `${expanded} ${addition}`.replace(/\s+/g, " ").trim();

    if (candidate.length <= 350) {
      expanded = candidate;
    }
  }

  return expanded;
}

function normalizeLoreEntityCasing(value: string, creature: Creature) {
  const preferredIdentityLabel = capitalizeTitle(creature.displayName);
  const escapedUsername = escapeForRegExp(creature.username);
  const escapedDisplayName = escapeForRegExp(creature.displayName);

  return value
    .replace(
      new RegExp(`\\b(?:${escapedUsername}|${escapedDisplayName})\\b`, "gi"),
      preferredIdentityLabel
    )
    .replace(/\bthey\b\s*,?/gi, "")
    .replace(/\btheir\b/gi, "the")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function sanitizeLore(value: string, fallback: string, creature: Creature) {
  const normalized = normalizeSpacing(value.replace(/\r\n/g, " ").replace(/\n+/g, " "));
  const fallbackLore = normalizeSpacing(
    normalizeLoreEntityCasing(fallback, creature).replace(/\n+/g, " ")
  );
  const candidate = normalizeSpacing(
    normalizeLoreEntityCasing(normalized, creature).replace(/\n+/g, " ")
  );
  const resolved =
    candidate.length >= 290 && candidate.length <= 350
      ? candidate
      : padLoreToMinimumLength(trimToMaxLength(candidate, 350), creature);

  if (resolved.length < 290 || resolved.length > 350) {
    return trimToMaxLength(padLoreToMinimumLength(fallbackLore, creature), 350);
  }

  return resolved;
}

function parseResponse(text: string, creature: Creature): CreatureCardCopy {
  const nameMatch = text.match(/^NAME:\s*(.+)$/im);
  const titleMatch = text.match(/^TITLE:\s*(.+)$/im);
  const loreMatch = text.match(/LORE:\s*([\s\S]*)$/i);

  return {
    name: sanitizeTitle(nameMatch?.[1] ?? "", creature),
    title: sanitizeSubtitle(titleMatch?.[1] ?? "", creature),
    lore: sanitizeLore(loreMatch?.[1] ?? "", getFallbackCopy(creature).lore, creature),
  };
}

function extractTextFromChoice(choice: ChatCompletionChoice | undefined) {
  if (!choice?.message) {
    return "";
  }

  const { content, reasoning_content, refusal } = choice.message;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (typeof part?.text === "string") {
          return part.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  if (typeof reasoning_content === "string" && reasoning_content.trim()) {
    return reasoning_content.trim();
  }

  if (typeof refusal === "string" && refusal.trim()) {
    return refusal.trim();
  }

  return "";
}

function getFallbackCopy(creature: Creature): CreatureCardCopy {
  const fallbackLore = [
    `${creature.displayName} appears here as ${creature.name}, a ${creature.metadata.traitLabel.toLowerCase()} shaped by ${creature.metadata.strongestModeLabel.toLowerCase()} pressure, disciplined movement, and the steady confidence of a proven rival.`,
    `The ${creature.metadata.affinity.toLowerCase()} motif, ${creature.rarity.toLowerCase()} finish, and ${creature.details.record.toLowerCase()} record make the creature feel like a serious fantasy opponent rather than a symbolic or poetic figure.`,
  ]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    name: capitalizeTitle(buildFallbackTitle(creature)),
    title: capitalizeTitle(creature.title),
    lore: fallbackLore,
  };
}

function shouldUseSimpleTextFirst() {
  return TEXT_MODEL === "step-3.5-flash";
}

async function generateViaSimpleTextEndpoint(input: {
  apiKey: string;
  prompt: string;
  systemPrompt: string;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), SIMPLE_TEXT_TIMEOUT_MS);
  const url = `${SIMPLE_TEXT_ENDPOINT}/${encodeURIComponent(input.prompt)}?${new URLSearchParams({
    model: TEXT_MODEL,
    key: input.apiKey,
    system: input.systemPrompt,
    temperature: "0.8",
  }).toString()}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return "";
    }

    return (await response.text()).trim();
  } catch {
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateViaChatEndpoint(input: {
  apiKey: string;
  prompt: string;
  systemPrompt: string;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    const response = await fetch(CHAT_COMPLETIONS_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          {
            role: "system",
            content: input.systemPrompt,
          },
          {
            role: "user",
            content: input.prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 220,
      }),
    });

    if (!response.ok) {
      return "";
    }

    const payload = (await response.json()) as {
      choices?: ChatCompletionChoice[];
    };

    return extractTextFromChoice(payload.choices?.[0]);
  } catch {
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateCardCopy(creature: Creature, prompt: string) {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      copy: getFallbackCopy(creature),
      source: "fallback",
    } satisfies CreatureCardCopyResult;
  }

  const systemPrompt = [
    "You are an elite writer of premium collectible trading card flavor text for fantasy chess champions.",
    "Write in the voice of a high-end trading card designer, never like an assistant.",
    "Write clear, natural fantasy prose, not poetry.",
    "Prefer straightforward descriptive sentences over lyrical, cryptic, or symbolic language.",
    "OUTPUT FORMAT (STRICT):",
    "Return exactly three labeled lines and nothing else.",
    "NAME: <card name>",
    "TITLE: <card subtitle>",
    "LORE: <lore text>",
    "NAME RULES:",
    "3-8 words.",
    "Title Case.",
    "Must incorporate the username or display name naturally as a name, epithet, or mythic figure.",
    "Make the card name feel collectible, mysterious, and powerful.",
    "Keep the name close to the canonical archetype provided in the prompt.",
    "Prefer mythic phrasing over descriptive phrasing.",
    "TITLE RULES:",
    "2-6 words.",
    "Title Case.",
    "Generate a premium role-style subtitle derived from the username and player identity.",
    "Keep the title semantically aligned with the same archetype as the generated name.",
    "LORE RULES:",
    "Write exactly one paragraph.",
    "Target 290-350 characters including spaces.",
    "The lore must explicitly include the display name and the generated card name naturally.",
    "Do not invent any additional nickname, alias, epithet, or alternate class name beyond the generated NAME and TITLE.",
    "Keep the lore semantically aligned with the same strongest mode and trait archetype used for NAME and TITLE.",
    "Describe what the character is like in a normal fantasy-card way: role, fighting style, presence, and atmosphere.",
    "Avoid weird poetry, prophecy language, surreal metaphors, abstract symbolism, and overwritten phrasing.",
    "Avoid sentence fragments unless absolutely necessary.",
    "Use the player grounding: bullet feels fast, blitz feels predatory, rapid feels precise, daily feels patient, titled players feel prestigious.",
    "Never mention Reddit, AI, prompts, Chess.com, generation, or app mechanics.",
    "Return ONLY the three required lines.",
  ].join("\n");

  const firstText = shouldUseSimpleTextFirst()
    ? await generateViaSimpleTextEndpoint({
        apiKey,
        prompt,
        systemPrompt,
      })
    : await generateViaChatEndpoint({
        apiKey,
        prompt,
        systemPrompt,
      });

  const resolvedText =
    firstText ||
    (shouldUseSimpleTextFirst()
      ? await generateViaChatEndpoint({
          apiKey,
          prompt,
          systemPrompt,
        })
      : await generateViaSimpleTextEndpoint({
          apiKey,
          prompt,
          systemPrompt,
        }));

  const parsed = parseResponse(resolvedText, creature);
  const fallback = getFallbackCopy(creature);

  return {
    copy: parsed,
    source:
      resolvedText.trim() && parsed.lore !== fallback.lore ? "generated" : "fallback",
  } satisfies CreatureCardCopyResult;
}

export async function resolveCreatureCardCopy(
  creature: Creature
): Promise<CreatureCardCopy> {
  const prompt = buildPrompt(creature);
  const cacheKey = createCacheKey(creature, prompt);
  const cachedCopy = await readFromCache(cacheKey);

  if (cachedCopy) {
    return cachedCopy;
  }

  const inFlight = inFlightCopy.get(cacheKey);

  if (inFlight) {
    return inFlight;
  }

  const request = (async () => {
    const result = await generateCardCopy(creature, prompt);

    if (result.source === "generated") {
      await writeToCache(cacheKey, result.copy);
    }

    return result.copy;
  })().finally(() => {
    inFlightCopy.delete(cacheKey);
  });

  inFlightCopy.set(cacheKey, request);

  return request;
}
