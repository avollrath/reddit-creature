import { generateCreatureFromProfile } from "@/lib/creatures/local-generator";
import {
  createLocalProfileSnapshot,
  normalizeUsername,
} from "@/lib/creatures/local-profile";
import type { Creature, PlayerProfileSnapshot } from "@/lib/creatures/types";
import { fetchChessPlayerSnapshot } from "@/lib/chesscom";

type ResolveCreatureInput = {
  username: string;
  profile?: PlayerProfileSnapshot | null;
};

export function resolveCreature({
  username,
  profile,
}: ResolveCreatureInput): Creature {
  const normalizedUsername = normalizeUsername(username);
  const resolvedProfile =
    profile && profile.username
      ? { ...profile, username: normalizeUsername(profile.username) }
      : createLocalProfileSnapshot(normalizedUsername);

  return generateCreatureFromProfile(resolvedProfile);
}

export async function resolveCreatureFromUsername(username: string): Promise<Creature> {
  const normalizedUsername = normalizeUsername(username);
  const lookup = await fetchChessPlayerSnapshot(normalizedUsername);
  const profile =
    lookup.profile ??
    {
      ...createLocalProfileSnapshot(normalizedUsername),
      lookupState: lookup.status,
      lookupMessage: lookup.message,
      warnings: lookup.message ? [lookup.message] : [],
    };

  const creature = resolveCreature({
    username: normalizedUsername,
    profile,
  });

  return creature;
}
