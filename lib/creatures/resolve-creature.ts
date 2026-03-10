import { generateCreatureFromProfile } from "@/lib/creatures/local-generator";
import {
  createLocalProfileSnapshot,
  normalizeUsername,
} from "@/lib/creatures/local-profile";
import type { Creature, RedditProfileSnapshot } from "@/lib/creatures/types";

type ResolveCreatureInput = {
  username: string;
  profile?: RedditProfileSnapshot | null;
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
