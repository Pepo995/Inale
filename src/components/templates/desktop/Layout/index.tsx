import React, { type ReactElement } from "react";
import { useUser } from "@clerk/nextjs";

import Loading from "@pages/Loading";
import NotAuthorized from "@pages/NotAuthorized";
import Sidebar from "@organisms/desktop/Sidebar";
import Navbar from "@organisms/desktop/Navbar";
import { SidebarItems } from "@constants";
import { api } from "@utils";
import { useTranslate } from "@hooks";
import Head from "next/head";

type LayoutProps = {
  children: ReactElement;
  header?: ReactElement;
};

const Layout = ({ children, header }: LayoutProps) => {
  const { isLoaded, user } = useUser();
  const { t } = useTranslate();

  const { isLoading, data: userData } = api.users.isUserAdmin.useQuery({
    userEmail: user?.emailAddresses[0]?.emailAddress ?? "",
  });

  const enabled = userData && userData.success && userData.isAdmin;

  return isLoading || !isLoaded ? (
    <Loading />
  ) : (
    <div className="flex min-h-screen w-full flex-1">
      {enabled ? (
        <>
          <Head>
            <title>{t("producers")}</title>
            <meta name="theme-color" content="#000000" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <Sidebar items={SidebarItems} />
          <div className="w-full bg-primary">
            <Navbar />
            <div className="p-10 md:p-20">
              {header && <div className="mb-6">{header}</div>}
              {children}
            </div>
          </div>
        </>
      ) : (
        <NotAuthorized />
      )}
    </div>
  );
};

export default Layout;
