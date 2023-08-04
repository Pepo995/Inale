import React, { type ReactElement } from "react";
import Navbar from "@organisms/mobile/Navbar";
import Head from "next/head";
import { useTranslate } from "@hooks";

type LayoutProps = {
  children: ReactElement;
  header?: ReactElement;
};

const Layout = ({ children, header }: LayoutProps) => {
  const { t } = useTranslate();

  return (
    <>
      <Head>
        <title>{t("producers")}</title>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen w-full flex-1">
        <div className="w-full bg-primary">
          <Navbar />
          <div className="p-8">
            {header && <div className="mb-6">{header}</div>}
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
export default Layout;
