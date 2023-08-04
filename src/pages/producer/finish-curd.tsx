import React, { type ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { NextPageWithLayout } from "../_app";
import MobileLayout from "@templates/mobile/Layout";
import FinishCurd from "@pages/mobile/FinishCurd";
import { appRouter } from "@api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { prisma } from "@db";

import { useProducerContext } from "@hooks";
import BatchError from "@pages/mobile/BatchError";
import CurdFinished from "@pages/mobile/CurdFinished";

type FinishCurdPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const FinishCurdPage: NextPageWithLayout<FinishCurdPageProps> = () => {
  const { currentDairyBatch } = useProducerContext();

  if (!currentDairyBatch) {
    return <BatchError />;
  }

  return !currentDairyBatch.curdEndDateTime ? <FinishCurd /> : <CurdFinished />;
};
FinishCurdPage.getLayout = (page: ReactElement) => (
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

export default FinishCurdPage;
