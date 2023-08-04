import React, { createContext, useState, useEffect, useMemo } from "react";
import { useStorage } from "@hooks";

interface AppContextType {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
}

const AppContext = createContext<AppContextType>({
  showSidebar: false,
  // intentionally empty
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setShowSidebar: () => {},
});

const AppContextProvider = ({ children }: { children: React.ReactElement }) => {
  const { getItem } = useStorage();

  const storedItem = getItem("showSidebar");

  const storedShowSidebar = useMemo(() => storedItem === "true", [storedItem]);
  const [showSidebar, setShowSidebar] = useState(storedShowSidebar ?? false);

  useEffect(() => {
    if (storedShowSidebar) setShowSidebar(storedShowSidebar);
  }, [storedShowSidebar]);
  return (
    <AppContext.Provider value={{ showSidebar, setShowSidebar }}>
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
