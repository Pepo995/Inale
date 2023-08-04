// @ts-check
/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
  },
  localePath:
    typeof window === "undefined"
      ? require("path").resolve("./public/locales")
      : "/public/locales",
  returnNull: false,
  fallbackLng: "es",
};
