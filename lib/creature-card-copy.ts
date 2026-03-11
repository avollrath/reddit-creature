import "server-only";

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Creature } from "@/lib/creatures";

type CreatureCardCopy = {
  name: string;
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
    `Preferred public profile label for the title and lore: ${creature.displayName}`,
    `If a Reddit profile title/public label exists, use this label instead of the raw username: ${creature.displayName}`,
    `Card title for tone reference only: ${creature.title}`,
    `Normalized username handle: ${creature.username}`,
    `Deterministic creature name: ${creature.name}`,
    `Deterministic role title: ${creature.title}`,
    `Deterministic description: ${creature.description}`,
    `Rarity: ${creature.rarity}`,
    `Affinity: ${creature.metadata.affinity}`,
    `Trait label: ${creature.metadata.traitLabel}`,
    `Rarity accent: ${creature.rarityAccent}`,
    `Power: ${creature.metadata.power}`,
    `Alignment: ${creature.stats.alignment}`,
    `Grounding source: ${creature.grounding.source}`,
    `Behavior archetype: ${creature.grounding.behaviorArchetype}`,
    `Account age in years: ${creature.grounding.accountAgeYears ?? "unknown"}`,
    `Verified: ${creature.grounding.isVerified}`,
    `Premium: ${creature.grounding.hasPremium}`,
    `Prefers night mode: ${creature.grounding.prefersNightmode}`,
    `Over 18 profile: ${creature.grounding.over18}`,
    `Moderator-like: ${creature.grounding.isModeratorLike}`,
  ].join(" ");
}

function createCacheKey(creature: Creature, prompt: string) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        version: 8,
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
      typeof parsed.lore === "string" &&
      parsed.lore.trim()
    ) {
      return {
        name: parsed.name.trim(),
        lore: parsed.lore.trim(),
      } satisfies CreatureCardCopy;
    }

    console.warn("[card-copy] Ignoring invalid cache entry", { cacheKey });
    return null;
  } catch {
    return null;
  }
}

async function writeToCache(cacheKey: string, copy: CreatureCardCopy) {
  try {
    await mkdir(COPY_CACHE_DIR, { recursive: true });
    await writeFile(getCacheFilePath(cacheKey), JSON.stringify(copy), "utf8");
  } catch (error) {
    console.warn("[card-copy] Failed to write cache entry", {
      cacheKey,
      message: error instanceof Error ? error.message : String(error),
    });
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

function buildUsernameFallbackTitle(creature: Creature) {
  const baseTitle = creature.title.replace(/^The\s+/i, "");
  return `${creature.displayName}, ${baseTitle}`;
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

function sanitizeTitle(value: string, creature: Creature) {
  const fallback = capitalizeTitle(buildUsernameFallbackTitle(creature));
  const sanitized = capitalizeTitle(sanitizeText(value, fallback, 64));
  const wordCount = getWordCount(sanitized);
  const normalizedTitle = normalizeForComparison(sanitized);
  const normalizedUsername = normalizeForComparison(creature.displayName);
  const hasAwkwardByPattern = new RegExp(
    `\\bby\\s+${escapeForRegExp(creature.displayName)}\\b`,
    "i"
  ).test(sanitized);
  const hasDeterministicWord = /\bdeterministic\b/i.test(sanitized);

  if (
    wordCount < 3 ||
    wordCount > 8 ||
    !normalizedUsername ||
    !normalizedTitle.includes(normalizedUsername) ||
    hasAwkwardByPattern ||
    hasDeterministicWord
  ) {
    return fallback;
  }

  return sanitized;
}

function escapeForRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitIntoParagraphs(value: string) {
  const explicitParagraphs = value
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  if (explicitParagraphs.length >= 2) {
    return explicitParagraphs.slice(0, 2);
  }

  const sentences = value
    .replace(/\s+/g, " ")
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean);

  if (!sentences || sentences.length < 2) {
    return explicitParagraphs;
  }

  const midpoint = Math.ceil(sentences.length / 2);
  return [
    sentences.slice(0, midpoint).join(" ").trim(),
    sentences.slice(midpoint).join(" ").trim(),
  ].filter(Boolean);
}

function sanitizeLore(value: string, fallback: string, creature: Creature) {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const paragraphs = splitIntoParagraphs(normalized).slice(0, 2);
  const sanitized = paragraphs.join("\n\n");
  const wordCount = getWordCount(sanitized.replace(/\n+/g, " "));
  const paragraphWordCounts = paragraphs.map((paragraph) => getWordCount(paragraph));

  if (
    paragraphs.length !== 2 ||
    wordCount < 18 ||
    wordCount > 42 ||
    paragraphWordCounts.some((count) => count < 8 || count > 20)
  ) {
    return ensureSingleLoreIdentityLabel(
      normalizeLoreEntityCasing(fallback, creature),
      creature
    );
  }

  return ensureSingleLoreIdentityLabel(
    normalizeLoreEntityCasing(sanitized, creature),
    creature
  );
}

function getPreferredLoreIdentityLabel(creature: Creature) {
  return capitalizeTitle(creature.displayName);
}

function normalizeLoreEntityCasing(value: string, creature: Creature) {
  const preferredIdentityLabel = getPreferredLoreIdentityLabel(creature);
  const normalizedCreatureName = capitalizeTitle(creature.name);
  const normalizedCreatureTitle = capitalizeTitle(creature.title);
  const escapedUsername = escapeForRegExp(creature.username);
  const escapedDisplayName = escapeForRegExp(creature.displayName);
  const escapedCreatureName = escapeForRegExp(creature.name);
  const escapedCreatureTitle = escapeForRegExp(creature.title);

  return value
    .replace(
      new RegExp(`\\b(?:${escapedUsername}|${escapedDisplayName})\\b`, "gi"),
      preferredIdentityLabel
    )
    .replace(new RegExp(escapedCreatureName, "gi"), normalizedCreatureName)
    .replace(new RegExp(escapedCreatureTitle, "gi"), normalizedCreatureTitle);
}

function ensureSingleLoreIdentityLabel(value: string, creature: Creature) {
  const preferredIdentityLabel = getPreferredLoreIdentityLabel(creature);
  const escapedUsername = escapeForRegExp(creature.username);
  const escapedDisplayName = escapeForRegExp(creature.displayName);
  const escapedCreatureTitle = escapeForRegExp(creature.title);
  const escapedCreatureName = escapeForRegExp(creature.name);
  const identityPattern = new RegExp(
    `\\b(?:${escapedDisplayName}|${escapedUsername})('s)?\\b`,
    "gi"
  );
  const paragraphs = splitIntoParagraphs(value).slice(0, 2);

  if (paragraphs.length !== 2) {
    return value;
  }

  let seenIdentity = false;
  const normalizedParagraphs = paragraphs.map((paragraph) =>
    paragraph
      .replace(new RegExp(escapedCreatureName, "gi"), preferredIdentityLabel)
      .replace(new RegExp(escapedCreatureTitle, "gi"), "the creature")
      .replace(identityPattern, (_match, possessive: string | undefined) => {
        if (!seenIdentity) {
          seenIdentity = true;
          return possessive ? `${preferredIdentityLabel}'s` : preferredIdentityLabel;
        }

        return possessive ? "its" : "it";
      })
      .replace(/\s+,/g, ",")
      .replace(/\s+\./g, ".")
      .replace(/\s{2,}/g, " ")
      .trim()
  );

  if (!seenIdentity) {
    normalizedParagraphs[0] = `${preferredIdentityLabel} ${normalizedParagraphs[0].charAt(0).toLowerCase()}${normalizedParagraphs[0].slice(1)}`;
  }

  return normalizedParagraphs.join("\n\n");
}

function parseResponse(text: string, creature: Creature): CreatureCardCopy {
  const titleMatch = text.match(/^TITLE:\s*(.+)$/im);
  const loreMatch = text.match(/LORE:\s*([\s\S]*)$/i);

  return {
    name: sanitizeTitle(titleMatch?.[1] ?? "", creature),
    lore: sanitizeLore(loreMatch?.[1] ?? "", creature.description, creature),
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
  return {
    name: capitalizeTitle(buildUsernameFallbackTitle(creature)),
    lore: normalizeLoreEntityCasing(creature.description, creature),
  };
}

function shouldUseSimpleTextFirst() {
  return TEXT_MODEL === "step-3.5-flash";
}

async function generateViaSimpleTextEndpoint(input: {
  apiKey: string;
  creature: Creature;
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

  console.info("[card-copy] Retrying via simple text endpoint", {
    username: input.creature.username,
    model: TEXT_MODEL,
    endpoint: SIMPLE_TEXT_ENDPOINT,
  });

  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("[card-copy] Simple text endpoint failed", {
        username: input.creature.username,
        model: TEXT_MODEL,
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return "";
    }

    const text = (await response.text()).trim();

    console.info("[card-copy] Raw simple text response", {
      username: input.creature.username,
      model: TEXT_MODEL,
      text,
    });

    return text;
  } catch (error) {
    console.warn("[card-copy] Simple text endpoint errored", {
      username: input.creature.username,
      model: TEXT_MODEL,
      message: error instanceof Error ? error.message : String(error),
    });
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateViaChatEndpoint(input: {
  apiKey: string;
  creature: Creature;
  prompt: string;
  systemPrompt: string;
}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHAT_TIMEOUT_MS);

  try {
    console.info("[card-copy] Starting Pollinations text generation", {
      username: input.creature.username,
      model: TEXT_MODEL,
      promptLength: input.prompt.length,
      endpoint: CHAT_COMPLETIONS_ENDPOINT,
    });

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
      const errorText = await response.text();
      console.warn("[card-copy] Pollinations text generation failed", {
        username: input.creature.username,
        model: TEXT_MODEL,
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      return "";
    }

    const payload = (await response.json()) as {
      choices?: ChatCompletionChoice[];
      usage?: unknown;
      model?: string;
      id?: string;
      object?: string;
    };
    const firstChoice = payload.choices?.[0];
    const text = extractTextFromChoice(firstChoice);

    console.info("[card-copy] Raw Pollinations text response", {
      username: input.creature.username,
      model: TEXT_MODEL,
      responseModel: payload.model ?? null,
      responseId: payload.id ?? null,
      responseObject: payload.object ?? null,
      usage: payload.usage ?? null,
      firstChoice: firstChoice ?? null,
      text,
    });

    return text;
  } catch (error) {
    console.warn("[card-copy] Pollinations text generation errored", {
      username: input.creature.username,
      model: TEXT_MODEL,
      message: error instanceof Error ? error.message : String(error),
    });
    return "";
  } finally {
    clearTimeout(timeoutId);
  }
}

async function generateCardCopy(creature: Creature, prompt: string) {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.warn("[card-copy] Missing Pollinations API key", {
      username: creature.username,
      model: TEXT_MODEL,
    });
    return {
      copy: getFallbackCopy(creature),
      source: "fallback",
    } satisfies CreatureCardCopyResult;
  }

const systemPrompt = [
"You are an elite writer of premium collectible trading card flavor text for surreal cyberpunk fantasy characters.",

"Write in the voice of a high-end trading card designer, never like an assistant.",

"OUTPUT FORMAT (STRICT):",
"Return exactly two labeled lines and nothing else.",
"TITLE: <card title>",
"LORE: <lore text>",

"TITLE RULES:",
"3–8 words.",
"Title Case.",
"Must incorporate the username naturally as a name, epithet, or mythic figure.",
"Examples of tone (do NOT copy):",
"Andre, Archivist of Viral Relics",
"Void Prophet Andre",
"Andre of the Chrome Catacombs",
"The Neon Oracle Andre",
"The Archivist Known as Andre",

"Make the title feel collectible, mysterious, and powerful.",
"Prefer mythic phrasing over descriptive phrasing.",
"Avoid awkward grammar or forced username placement.",
"Do not simply reuse the deterministic role title word-for-word unless it is transformed into something more distinctive.",
"Avoid overusing generic constructions like 'Sentinel of Cinder Threads' or other stock fantasy phrasing.",
"Ground the tone in the profile signals you were given: karma, account age, commenter/poster balance, verification, premium, and night-mode preference should subtly influence the title and lore.",

"Never include:",
"hashtags, emojis, internet slang, jokes, or assistant-like wording.",
"Avoid generic fantasy filler like 'the chosen one' or 'ancient warrior'.",

"LORE RULES:",
"30–50 words total.",
"Two short paragraphs separated by a blank line.",
"Each paragraph 15–25 words.",
"Atmospheric flavor text like a premium trading card.",
"The lore must explicitly include the display name and the card title naturally within the two paragraphs.",
"Use the profile grounding to make the lore specific: low karma should feel smaller or scrappier, higher karma should feel grander, older accounts should feel older, commenter/poster balance should affect the persona.",

"FINAL LENGTH PRIORITY: keep total lore between 18 and 56 words.",
"FINAL LENGTH PRIORITY: keep each paragraph between 8 and 28 words.",
"Style:",
"surreal",
"bizarre",
"popup cyberpunk",
"mythic techno-fantasy",
"vivid imagery",

"The lore must reference the username naturally as a character or entity.",

"Never mention:",
"Reddit, AI, prompts, cards, or the generation process.",

"Return ONLY the two required lines."
].join("\n");

  const firstText = shouldUseSimpleTextFirst()
    ? await generateViaSimpleTextEndpoint({
        apiKey,
        creature,
        prompt,
        systemPrompt,
      })
    : await generateViaChatEndpoint({
        apiKey,
        creature,
        prompt,
        systemPrompt,
      });

  const resolvedText =
    firstText ||
    (shouldUseSimpleTextFirst()
      ? await generateViaChatEndpoint({
          apiKey,
          creature,
          prompt,
          systemPrompt,
        })
      : await generateViaSimpleTextEndpoint({
          apiKey,
          creature,
          prompt,
          systemPrompt,
        }));

  const parsed = parseResponse(resolvedText, creature);
  const fallback = getFallbackCopy(creature);
  const usedFallbackName = parsed.name === fallback.name;
  const usedFallbackLore = parsed.lore === fallback.lore;
  const hasModelOutput = resolvedText.trim().length > 0;

  console.info("[card-copy] Pollinations text generation succeeded", {
    username: creature.username,
    model: TEXT_MODEL,
    name: parsed.name,
    lore: parsed.lore,
    usedFallbackName,
    usedFallbackLore,
  });

  return {
    copy: parsed,
    source:
      hasModelOutput && !usedFallbackLore ? "generated" : "fallback",
  } satisfies CreatureCardCopyResult;
}

export async function resolveCreatureCardCopy(
  creature: Creature
): Promise<CreatureCardCopy> {
  const prompt = buildPrompt(creature);
  const cacheKey = createCacheKey(creature, prompt);
  const cachedCopy = await readFromCache(cacheKey);

  if (cachedCopy) {
    console.info("[card-copy] Cache hit", {
      username: creature.username,
      model: TEXT_MODEL,
      name: cachedCopy.name,
      lore: cachedCopy.lore,
    });
    return cachedCopy;
  }

  console.info("[card-copy] Cache miss", {
    username: creature.username,
    model: TEXT_MODEL,
  });

  const inFlight = inFlightCopy.get(cacheKey);

  if (inFlight) {
    return inFlight;
  }

  const request = (async () => {
    const result = await generateCardCopy(creature, prompt);

    if (result.source === "generated") {
      console.info("[card-copy] Caching generated copy", {
        username: creature.username,
        model: TEXT_MODEL,
        name: result.copy.name,
        lore: result.copy.lore,
      });
      await writeToCache(cacheKey, result.copy);
    } else {
      console.info("[card-copy] Using fallback copy without caching", {
        username: creature.username,
        model: TEXT_MODEL,
        name: result.copy.name,
        lore: result.copy.lore,
      });
    }

    console.info("[card-copy] Final copy selected", {
      username: creature.username,
      model: TEXT_MODEL,
      source: result.source,
      name: result.copy.name,
      lore: result.copy.lore,
    });

    return result.copy;
  })().finally(() => {
    inFlightCopy.delete(cacheKey);
  });

  inFlightCopy.set(cacheKey, request);

  return request;
}
