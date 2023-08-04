import { useAppContext } from "@hooks";
import SidebarItem from "@molecules/SidebarItem";
import { type SidebarItemProps } from "@types";
import Image from "next/image";
import { useRouter } from "next/router";

type SidebarProps = {
  items: SidebarItemProps[];
};

const Sidebar = ({ items }: SidebarProps) => {
  const router = useRouter();
  const pathname = router.pathname;

  const { showSidebar } = useAppContext();
  return (
    <aside
      className={`h-inherit bg-secondary ${showSidebar ? "block" : "hidden"}`}
    >
      <div className="my-6 flex justify-center">
        <Image
          alt="INALE"
          src="https://inale-public-files.s3.us-east-2.amazonaws.com/01_INALE_Marca%20%283%29.png"
          width="0"
          height="0"
          sizes="100vw"
          className="w-40 bg-white"
        />
      </div>
      <div className="flex w-full flex-col justify-center gap-y-16 md:w-64">
        <div className="flex w-full flex-col gap-y-12">
          {items.map(({ titleKey, path, Icon }, index) => (
            <SidebarItem
              titleKey={titleKey}
              path={path}
              key={`sidebar-${index}`}
              selected={pathname === path}
              Icon={Icon}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
