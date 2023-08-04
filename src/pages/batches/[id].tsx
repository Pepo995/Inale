import React from "react";
import type { ReactElement } from "react";

import Layout from "@templates/desktop/Layout";

import type { NextPageWithLayout } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Typography from "@atoms/Typography";
import { parseBatchDatesToDate, serializableBatchWithDairy } from "@utils";
import { prisma } from "@db";
import superjson from "superjson";

import { useTranslate } from "@hooks";
import Batch from "@pages/Batch";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@api/root";
import { type FormatedDateBatchWithDairy } from "@types";

type BatchPageProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
  result: {
    success: boolean;
    batch: FormatedDateBatchWithDairy | null;
    message?: string;
    translationKey?: string;
  };
};

const BatchPage: NextPageWithLayout<BatchPageProps> = ({ result }) => {
  const { t } = useTranslate();

  if (!result || !result.success || !result.batch)
    return (
      <Typography>
        {t(result.translationKey ?? "errors.batchNotFound")}
      </Typography>
    );

  return <Batch batch={parseBatchDatesToDate(result.batch)} />;
};

BatchPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, req: undefined },
    transformer: superjson,
  });

  const { query } = context;
  const { id } = query;

  const result =
    typeof id === "string"
      ? await helpers.batches.getBatchById.fetch({ id })
      : { batch: null };

  return {
    props: {
      result: {
        ...result,
        batch: result.batch ? serializableBatchWithDairy(result.batch) : null,
      },
      trpcState: helpers.dehydrate(),
      ...(await serverSideTranslations(context.locale || "es", ["common"])),
    },
  };
};

export default BatchPage;
