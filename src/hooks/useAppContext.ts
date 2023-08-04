import { AppContext } from "@context";
import { useContext } from "react";
import { useStorage } from "@hooks";

const useAppContext = () => {
  const { showSidebar, setShowSidebar: set } = useContext(AppContext);
  const { setItem } = useStorage();

  const setShowSidebar = (show: boolean) => {
    setItem("showSidebar", show.toString());
    set(show);
  };
  return { showSidebar, setShowSidebar };
};

export default useAppContext;
