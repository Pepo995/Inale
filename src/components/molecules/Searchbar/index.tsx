import { SearchIcon } from "lucide-react";
import { useTranslate } from "@hooks";

type SearchBarProps = {
  onTextChange: (newText: string) => void;
};
const Searchbar = ({ onTextChange }: SearchBarProps) => {
  const { t } = useTranslate();

  return (
    <div className="relative h-[33px]">
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center py-2 pr-4">
        <SearchIcon width={20} />
        <span className="sr-only">{t("navbar.searchIcon")}</span>
      </div>
      <input
        type="text"
        className="placeholder:text-gray text-gray block w-full rounded-3xl bg-gray-100 px-3 py-2 text-sm leading-4"
        placeholder={`${t("navbar.search")}...`}
        onChange={(e) => onTextChange(e.target.value)}
      />
    </div>
  );
};

export default Searchbar;
