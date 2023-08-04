import { useEffect, useState } from "react";

type StorageType = "session" | "local";

type UseStorageReturnValue = {
  getItem: (key: string, type?: StorageType) => string;
  setItem: (key: string, value: string, type?: StorageType) => void;
};

const useStorage = (): UseStorageReturnValue => {
  const isBrowser: boolean = typeof window !== "undefined";
  const [sessionStorage, setSessionStorage] = useState<Storage>();
  const [localStorage, setLocalStorage] = useState<Storage>();

  useEffect(() => {
    if (isBrowser) {
      setSessionStorage(window.sessionStorage);
      setLocalStorage(window.localStorage);
    }
  }, [isBrowser]);

  const getItem: (key: string, type?: StorageType) => string = (key, type) => {
    const storageType: Storage | undefined =
      type === "local" ? localStorage : sessionStorage;
    return storageType ? storageType.getItem(key) || "" : "";
  };

  const setItem: (key: string, value: string, type?: StorageType) => void = (
    key,
    value,
    type
  ) => {
    const storageType: Storage | undefined =
      type === "local" ? localStorage : sessionStorage;
    if (storageType) {
      storageType.setItem(key, value);
    }
  };

  return {
    getItem,
    setItem,
  };
};

export default useStorage;
