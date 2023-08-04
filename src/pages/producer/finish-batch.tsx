import React, { type ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { NextPageWithLayout } from "../_app";
import MobileLayout from "@templates/mobile/Layout";
import FinishBatch from "@pages/mobile/FinishBatch";
import { appRouter } from "@api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { prisma } from "@db";

import { useProducerContext } from "@hooks";
import BatchError from "@pages/mobile/BatchError";
import BatchWaitingReview from "@molecules/BatchWaitingReview";

type FinishBatchPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const FinishBatchPage: NextPageWithLayout<FinishBatchPageProps> = () => {
  const { currentDairyBatch } = useProducerContext();

  if (!currentDairyBatch) {
    return <BatchError />;
  }

  return !currentDairyBatch.maturationEndDateTime ? (
    <FinishBatch />
  ) : (
    <BatchWaitingReview batchName={currentDairyBatch.batchName} />
  );
};
FinishBatchPage.getLayout = (page: ReactElement) => (
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

export default FinishBatchPage;
