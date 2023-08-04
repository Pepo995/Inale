import React from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { NextPageWithLayout } from "../_app";
import { appRouter } from "@api/root";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { prisma } from "@db";
import { parseBatchDatesToDate, serializableBatchWithDairy } from "@utils";
import Typography from "@atoms/Typography";

import { useTranslate } from "@hooks";
import CertificationStatus from "@pages/CertificationStatus";
import { type FormatedDateBatchWithDairy } from "@types";

type CertificationResultPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
> & {
  result: {
    success: boolean;
    batch: FormatedDateBatchWithDairy | null;
    message?: string;
    translationKey?: string;
  };
};

const CertificationResultPage: NextPageWithLayout<
  CertificationResultPageProps
> = ({ result }) => {
  const { t } = useTranslate();
  if (!result || !result.success || !result.batch)
    return (
      <Typography>
        {t(result.translationKey ?? "errors.batchNotFound")}
      </Typography>
    );

  return (
    <CertificationStatus
      batch={parseBatchDatesToDate(result.batch)}
      isAdmin={true}
    />
  );
};

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

export default CertificationResultPage;
