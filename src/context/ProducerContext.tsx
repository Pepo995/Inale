import React, { createContext, useEffect, useState, useMemo } from "react";
import type { BatchWithDairy } from "@types";
import { useStorage } from "@hooks";

type ProducerContextType = {
  currentDairyBatch?: BatchWithDairy;
  setCurrentDairyBatch: (currentDairyBatch: BatchWithDairy) => void;
};

const ProducerContext = createContext<ProducerContextType>({
  // intentionally empty
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setCurrentDairyBatch: () => {},
});

const parseStoredItem = (storedItem: string | null) => {
  if (storedItem) {
    const parsedItem = JSON.parse(storedItem) as BatchWithDairy;
    if (parsedItem.createdAt) {
      parsedItem.createdAt = new Date(parsedItem.createdAt);
    }
    if (parsedItem.currentStepDateTime) {
      parsedItem.currentStepDateTime = new Date(parsedItem.currentStepDateTime);
    }
    if (parsedItem.curdInitDateTime) {
      parsedItem.curdInitDateTime = new Date(parsedItem.curdInitDateTime);
    }
    if (parsedItem.curdEndDateTime) {
      parsedItem.curdEndDateTime = new Date(parsedItem.curdEndDateTime);
    }
    if (parsedItem.saltingInitDateTime) {
      parsedItem.saltingInitDateTime = new Date(parsedItem.saltingInitDateTime);
    }
    if (parsedItem.maturationInitDateTime) {
      parsedItem.maturationInitDateTime = new Date(
        parsedItem.maturationInitDateTime
      );
    }
    if (parsedItem.maturationEndDateTime) {
      parsedItem.maturationEndDateTime = new Date(
        parsedItem.maturationEndDateTime
      );
    }
    return parsedItem;
  }

  return undefined;
};

const ProducerContextProvider = ({
  children,
}: {
  children: React.ReactElement;
}) => {
  const { getItem } = useStorage();

  const storedItem = getItem("currentDairyBatch");

  const storedCurrentDairyBatch = useMemo(
    () => parseStoredItem(storedItem),
    [storedItem]
  );

  const [currentDairyBatch, setCurrentDairyBatch] = useState(
    storedCurrentDairyBatch
  );

  useEffect(() => {
    setCurrentDairyBatch(storedCurrentDairyBatch);
  }, [storedCurrentDairyBatch]);

  return (
    <ProducerContext.Provider
      value={{ currentDairyBatch, setCurrentDairyBatch }}
    >
      {children}
    </ProducerContext.Provider>
  );
};

export { ProducerContext, ProducerContextProvider };
