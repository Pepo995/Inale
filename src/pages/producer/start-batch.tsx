import React, { type ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { NextPageWithLayout } from "../_app";
import MobileLayout from "@templates/mobile/Layout";
import StartBatch from "@pages/mobile/StartBatch";
import { appRouter } from "@api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { prisma } from "@db";

import { useProducerContext } from "@hooks";
import BatchError from "@pages/mobile/BatchError";
import StartCurd from "@pages/mobile/StartCurd";
import CurdStarted from "@pages/mobile/CurdStarted";
import Loading from "@pages/Loading";
import { api } from "@utils";

type StartBatchPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const StartBatchPage: NextPageWithLayout<StartBatchPageProps> = () => {
  const { currentDairyBatch, setCurrentDairyBatch } = useProducerContext();

  const { isLoading, data: result } = currentDairyBatch?.dairyRut
    ? api.dairies.getDairyCheeseTypesByRut.useQuery({
        dairyRut: currentDairyBatch.dairyRut,
      })
    : { isLoading: false, data: null };

  if (isLoading) return <Loading />;

  if (!currentDairyBatch || !result?.cheeseTypes) return <BatchError />;

  return !currentDairyBatch.started ? (
    <StartBatch
      cheeseTypes={result.cheeseTypes}
      onBatchStarted={(newBatch) =>
        setCurrentDairyBatch({
          ...currentDairyBatch,
          ...newBatch,
          started: true,
        })
      }
    />
  ) : !currentDairyBatch.curdInitDateTime ? (
    <StartCurd
      showSuccessfullyCreated
      onCurdStarted={(newBatch) =>
        setCurrentDairyBatch({
          ...currentDairyBatch,
          ...newBatch,
        })
      }
    />
  ) : (
    <CurdStarted />
  );
};
StartBatchPage.getLayout = (page: ReactElement) => (
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

export default StartBatchPage;
