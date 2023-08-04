import React, { useEffect, type ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { NextPageWithLayout } from "../_app";
import MobileLayout from "@templates/mobile/Layout";
import { appRouter } from "@api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { api } from "@utils";
import { prisma } from "@db";

import { useProducerContext } from "@hooks";
import BatchError from "@pages/mobile/BatchError";
import Loading from "@pages/Loading";
import { useRouter } from "next/router";

type BatchLandingPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const BatchLandingPage: NextPageWithLayout<BatchLandingPageProps> = ({
  token,
}) => {
  const { currentDairyBatch, setCurrentDairyBatch } = useProducerContext();

  const { isLoading, data: result } =
    typeof token === "string"
      ? api.batches.getBatchByToken.useQuery({
          token,
        })
      : { isLoading: false, data: null };

  useEffect(() => {
    const differentBatch =
      result?.batch &&
      (currentDairyBatch
        ? JSON.stringify(currentDairyBatch) !== JSON.stringify(result.batch)
        : !currentDairyBatch);

    if (result?.batch && differentBatch) setCurrentDairyBatch(result.batch);
  }, [result?.batch, setCurrentDairyBatch, currentDairyBatch]);

  const router = useRouter();

  if (isLoading) return <Loading />;

  if (!result?.batch || !currentDairyBatch) return <BatchError />;

  if (!result.batch.started) void router.push("start-batch");
  else if (!result.batch.curdInitDateTime) void router.push("start-curd");
  else if (!result.batch.curdEndDateTime) void router.push("finish-curd");
  else if (!result.batch.saltingInitDateTime) void router.push("start-salting");
  else if (!result.batch.maturationInitDateTime)
    void router.push("start-maturation");
  else if (!result.batch.maturationEndDateTime)
    void router.push("finish-batch");
  else void router.push("certification-status");
  return null;
};
BatchLandingPage.getLayout = (page: ReactElement) => (
  <MobileLayout>{page}</MobileLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, req: undefined },
    transformer: superjson,
  });

  const { query } = context;
  const { token } = query;

  return {
    props: {
      token: token ?? null,
      trpcState: helpers.dehydrate(),
      ...(await serverSideTranslations(context.locale || "es", ["common"])),
    },
  };
};

export default BatchLandingPage;
