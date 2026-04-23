// Vitest config has `globals: true`, exposing describe/it/expect/vi as
// ambient globals at runtime. This file makes those types visible to the
// TypeScript compiler without needing each spec to import from "vitest".
// A `types: ["vitest/globals"]` entry in tsconfig would be more direct
// but requires nodenext/bundler moduleResolution; the project uses the
// classic resolver for library emit compatibility.
/// <reference types="vitest/globals" />
