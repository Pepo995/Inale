import type { SidebarItemProps } from "@types";
import {
  LayoutDashboard,
  TableIcon,
  PieChartIcon,
  ClipboardIcon,
  UserPlusIcon,
  FileTextIcon,
} from "lucide-react";

const SidebarItems: SidebarItemProps[] = [
  { titleKey: "sidebar.main", path: "/", Icon: LayoutDashboard },
  {
    titleKey: "sidebar.addAdmin",
    path: "/add-new-admin",
    Icon: UserPlusIcon,
  },
  { titleKey: "sidebar.dairies", path: "/dairies", Icon: TableIcon },
  {
    titleKey: "sidebar.cheeseTypes",
    path: "/cheese-types",
    Icon: PieChartIcon,
  },
  { titleKey: "sidebar.reports", path: "/reports", Icon: ClipboardIcon },
  { titleKey: "sidebar.batches", path: "/batches", Icon: FileTextIcon },
];

export default SidebarItems;
