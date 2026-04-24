// Baseline seed mirrors the handful of rickandmortyapi entities referenced by
// existing tests (Rick Sanchez at id=1) plus enough extra rows to exercise
// list pagination and mutations without feeling like a single-row fixture.
//
// Every runId starts from a deep-cloned copy of this seed (see store.ts).

import type { CharacterRow, EpisodeRow, LocationRow, Store } from "./store.ts";

const rick: CharacterRow = {
  id: "1",
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  created: "2017-11-04T18:48:46.250Z",
  originId: "1",
  locationId: "3",
  episodeIds: ["1", "2"],
};

const morty: CharacterRow = {
  id: "2",
  name: "Morty Smith",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg",
  created: "2017-11-04T18:50:21.651Z",
  originId: "1",
  locationId: "3",
  episodeIds: ["1", "2"],
};

const summerSmith: CharacterRow = {
  id: "3",
  name: "Summer Smith",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Female",
  image: "https://rickandmortyapi.com/api/character/avatar/3.jpeg",
  created: "2017-11-04T19:09:56.428Z",
  originId: "1",
  locationId: "3",
  episodeIds: ["2"],
};

const earth: LocationRow = {
  id: "1",
  name: "Earth (C-137)",
  type: "Planet",
  dimension: "Dimension C-137",
  residentIds: [],
  created: "2017-11-10T12:42:04.162Z",
};

const citadel: LocationRow = {
  id: "3",
  name: "Citadel of Ricks",
  type: "Space station",
  dimension: "unknown",
  residentIds: ["1", "2", "3"],
  created: "2017-11-10T13:08:13.191Z",
};

const pilot: EpisodeRow = {
  id: "1",
  name: "Pilot",
  air_date: "December 2, 2013",
  episode: "S01E01",
  characterIds: ["1", "2"],
  created: "2017-11-10T12:56:33.798Z",
};

const lawnmowerDog: EpisodeRow = {
  id: "2",
  name: "Lawnmower Dog",
  air_date: "December 9, 2013",
  episode: "S01E02",
  characterIds: ["1", "2", "3"],
  created: "2017-11-10T12:56:33.916Z",
};

export function buildSeed(): Store {
  return {
    characters: new Map(
      [rick, morty, summerSmith].map((c) => [c.id, structuredClone(c)])
    ),
    locations: new Map(
      [earth, citadel].map((l) => [l.id, structuredClone(l)])
    ),
    episodes: new Map(
      [pilot, lawnmowerDog].map((e) => [e.id, structuredClone(e)])
    ),
    nextIds: { character: 4, location: 4, episode: 3 },
  };
}
