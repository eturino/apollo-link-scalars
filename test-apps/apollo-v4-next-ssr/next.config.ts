import type { NextConfig } from "next";

// graphql v17's `exports` map lists the `module` condition before `require`,
// so Next resolves the externalized server copy to `index.mjs` and then
// `require()`s it, which Node rejects. Bundling graphql avoids the external.
const nextConfig: NextConfig = {
  transpilePackages: ["graphql"],
};

export default nextConfig;
