import { useTranslation } from "next-i18next";
import type { TOptions } from "i18next";

const useTranslate = () => {
  const { t: translate } = useTranslation("common");

  return {
    t: (key: string | string[], options?: TOptions) =>
      translate(key, options ?? {}) ?? (typeof key === "string" ? key : key[0]),
  };
};

export type CustomTFunction = ReturnType<typeof useTranslate>;

export default useTranslate;
