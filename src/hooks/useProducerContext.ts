import type { BatchWithDairy } from "@types";
import { ProducerContext } from "../context/ProducerContext";
import { useContext } from "react";
import { useStorage } from "@hooks";

const useProducerContext = () => {
  const { currentDairyBatch, setCurrentDairyBatch: set } =
    useContext(ProducerContext);

  const { setItem } = useStorage();

  const setCurrentDairyBatch = (currentDairyBatch: BatchWithDairy) => {
    setItem("currentDairyBatch", JSON.stringify(currentDairyBatch));
    set(currentDairyBatch);
  };

  return { currentDairyBatch, setCurrentDairyBatch };
};

export default useProducerContext;
