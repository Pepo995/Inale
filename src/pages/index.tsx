import React from "react";
import type { ReactElement } from "react";
import Layout from "@templates/desktop/Layout";
import type { NextPageWithLayout } from "./_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslate } from "@hooks";
import Typography from "@atoms/Typography";
import GenerateQR from "@pages/GenerateQr";
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@api/root";
import { prisma } from "@db";
import type { FormatedDateDairy } from "@types";
import superjson from "superjson";
import { serializableDairy } from "@utils";

type HomeProps = InferGetServerSidePropsType<typeof getServerSideProps> & {
  dairies: FormatedDateDairy[] | null;
};

const Home: NextPageWithLayout<HomeProps> = ({ dairies }) => {
  const { t } = useTranslate();
  if (!dairies)
    return <Typography>{t("dairies.errorLoadingDairies")}</Typography>;

  return (
    <div className="flex">
      <GenerateQR dairies={dairies} />
    </div>
  );
};

Home.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, req: undefined },
    transformer: superjson,
  });

  const result = await helpers.dairies.getAllDairies.fetch();

  return {
    props: {
      dairies: result.dairies?.map(serializableDairy) ?? null,
      trpcState: helpers.dehydrate(),
      ...(await serverSideTranslations(context.locale || "es", ["common"])),
    },
  };
};

export default Home;
