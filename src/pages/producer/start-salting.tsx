import React, { type ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { NextPageWithLayout } from "../_app";
import MobileLayout from "@templates/mobile/Layout";
import StartSalting from "@pages/mobile/StartSalting";
import { appRouter } from "@api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { prisma } from "@db";

import { useProducerContext } from "@hooks";
import BatchError from "@pages/mobile/BatchError";
import SaltingStarted from "@pages/mobile/SaltingStarted";

type StartSaltingPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const StartSaltingPage: NextPageWithLayout<StartSaltingPageProps> = ({}) => {
  const { currentDairyBatch } = useProducerContext();

  if (!currentDairyBatch) {
    return <BatchError />;
  }

  return !currentDairyBatch.saltingInitDateTime ? (
    <StartSalting />
  ) : (
    <SaltingStarted />
  );
};
StartSaltingPage.getLayout = (page: ReactElement) => (
  <MobileLayout>{page}</MobileLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, req: undefined },
    transformer: superjson,
  });

  return {
    props: {
      trpcState: helpers.dehydrate(),
      ...(await serverSideTranslations(context.locale || "es", ["common"])),
    },
  };
};

export default StartSaltingPage;
