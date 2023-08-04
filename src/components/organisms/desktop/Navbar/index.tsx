import MenuIcon from "public/icons/MenuIcon";
import { useAppContext } from "@hooks";
import { UserButton } from "@clerk/nextjs";

const Navbar = () => {
  const { setShowSidebar, showSidebar } = useAppContext();
  return (
    <nav className="sticky z-40 flex w-full flex-row flex-wrap items-center justify-between bg-white p-4">
      <div className="flex w-1/2 flex-row items-center gap-x-8">
        <button onClick={() => setShowSidebar(!showSidebar)}>
          <MenuIcon />
        </button>
      </div>
      <div className="flex flex-row items-center gap-x-5">
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
};

export default Navbar;
