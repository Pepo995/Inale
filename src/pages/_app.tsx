import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next";

import { api } from "@utils";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { AppContextProvider, ProducerContextProvider } from "@context";
import { Toaster } from "react-hot-toast";
import { esES } from "@clerk/localizations";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

const MyApp = ({ Component, pageProps }: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <ClerkProvider
        {...pageProps}
        localization={esES}
        appearance={{
          variables: {
            colorShimmer: "#e1e7ef",
            colorAlphaShade: "#e1e7ef",
            colorPrimary: "#4C7BD6",
            colorDanger: "#CB444A",
            colorSuccess: "#58B88F",
            colorAlphaShaded: "#e1e7ef",
            colorText: "#e1e7ef",
            colorTextOnPrimaryBackground: "#e1e7ef",
            colorTextSecondary: "#e1e7ef",
            colorBackground: "#242E3B",
            colorInputBackground: "#e1e7ef",
            borderRadius: "0.5rem",
          },
          elements: {
            rootBox: "h-fit dark",
            card: "rounded-lg border text-card-foreground shadow-sm",
            headerTitle: "text-tertiary",
            userButtonPopoverActionButtonIcon: "text-tertiary",
            userButtonPopoverFooter: "p-4 text-white",
            userButtonPopoverCard: "py-4 pb-0",
          },
        }}
      >
        <AppContextProvider {...pageProps}>
          <ProducerContextProvider {...pageProps}>
            {getLayout(<Component {...pageProps} />)}
          </ProducerContextProvider>
        </AppContextProvider>
      </ClerkProvider>
      <Toaster />
    </>
  );
};
export default api.withTRPC(appWithTranslation(MyApp));
