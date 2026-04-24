// Per-runId partitioned in-memory store. Each runId addresses an isolated
// copy of the seed data so parallel test suites and browser sessions can
// mutate state without stepping on each other.
//
// Read-only callers that omit the X-Run-Id header share a single read-only
// store keyed by SHARED_READONLY_ID; mutations against that store throw.

import { EventEmitter } from "node:events";
import { buildSeed } from "./seed.ts";

export interface CharacterRow {
  id: string;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
  created: string;
  originId: string | null;
  locationId: string | null;
  episodeIds: string[];
}

export interface LocationRow {
  id: string;
  name: string;
  type: string;
  dimension: string;
  residentIds: string[];
  created: string;
}

export interface EpisodeRow {
  id: string;
  name: string;
  air_date: string;
  episode: string;
  characterIds: string[];
  created: string;
}

export interface Store {
  characters: Map<string, CharacterRow>;
  locations: Map<string, LocationRow>;
  episodes: Map<string, EpisodeRow>;
  nextIds: { character: number; location: number; episode: number };
}

export const SHARED_READONLY_ID = "__shared_readonly__";

export interface StoreHandle {
  runId: string;
  readonly: boolean;
  store: Store;
  events: EventEmitter;
}

const stores = new Map<string, Store>();
const events = new Map<string, EventEmitter>();

export function getStore(runId: string | undefined): StoreHandle {
  const effectiveId = runId && runId.length > 0 ? runId : SHARED_READONLY_ID;
  let store = stores.get(effectiveId);
  if (!store) {
    store = buildSeed();
    stores.set(effectiveId, store);
  }
  let emitter = events.get(effectiveId);
  if (!emitter) {
    emitter = new EventEmitter();
    emitter.setMaxListeners(100);
    events.set(effectiveId, emitter);
  }
  return {
    runId: effectiveId,
    readonly: effectiveId === SHARED_READONLY_ID,
    store,
    events: emitter,
  };
}

export function resetStore(runId: string): void {
  stores.delete(runId);
  const emitter = events.get(runId);
  if (emitter) emitter.removeAllListeners();
  events.delete(runId);
}
