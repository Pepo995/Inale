import React from "react";
import type { ReactElement } from "react";

import Layout from "@templates/desktop/Layout";

import type { NextPageWithLayout } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";

import CheeseTypeComponent from "@pages/CheeseType";
import type { CheeseType } from "@types";

type CheeseTypePageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const CheeseTypePage: NextPageWithLayout<CheeseTypePageProps> = () => {
  const defaultCheeseType: CheeseType = {
    name: "",
    minCurdTemperature: 0,
    maxCurdTemperature: 0,
    minCurdMinutes: 0,
    maxCurdMinutes: 0,
    minSaltingSalinity: 0,
    maxSaltingSalinity: 0,
    minSaltingMinutes: 0,
    maxSaltingMinutes: 0,
    minMaturationTemperature: 0,
    maxMaturationTemperature: 0,
    minMaturationHumidity: 0,
    maxMaturationHumidity: 0,
    minMaturationMinutes: 0,
    maxMaturationMinutes: 0,
  };

  return <CheeseTypeComponent isCreating cheeseType={defaultCheeseType} />;
};

CheeseTypePage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default CheeseTypePage;
