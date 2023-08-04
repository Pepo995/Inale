/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import i18nConfig from "./next-i18next.config.js";

/** @type {import("next").NextConfig} */

const config = {
  // And then the next config
  reactStrictMode: true,

  i18n: i18nConfig.i18n,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "inale-public-files.s3.us-east-2.amazonaws.com",
      },
    ],
  },
  output: "standalone",
};
export default config;
