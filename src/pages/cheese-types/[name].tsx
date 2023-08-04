import React from "react";
import type { ReactElement } from "react";

import Layout from "@templates/desktop/Layout";

import type { NextPageWithLayout } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import CheeseTypeComponent from "@pages/CheeseType";
import { api } from "@utils";
import { useRouter } from "next/router";
import Loading from "@pages/Loading";
import Typography from "@atoms/Typography";
import { useTranslate } from "@hooks";

type CheeseTypePageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const CheeseTypePage: NextPageWithLayout<CheeseTypePageProps> = () => {
  const { t } = useTranslate();
  const {
    query: { name },
  } = useRouter();
  const { isLoading, data: result } =
    typeof name === "string"
      ? api.cheeseTypes.getCheeseType.useQuery({ name })
      : { isLoading: false, data: { success: false } };
  if (isLoading) return <Loading />;

  if (!result || !result.success || !result.cheeseType)
    return (
      <Typography>
        {t(result?.translationKey ?? "cheeseTypes.errorLoadingCheeseType")}
      </Typography>
    );

  return <CheeseTypeComponent cheeseType={result.cheeseType} />;
};

CheeseTypePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default CheeseTypePage;
