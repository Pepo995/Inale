import React, { type ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { NextPageWithLayout } from "../_app";
import MobileLayout from "@templates/mobile/Layout";
import StartCurd from "@pages/mobile/StartCurd";

import { useProducerContext } from "@hooks";
import BatchError from "@pages/mobile/BatchError";
import CurdStarted from "@pages/mobile/CurdStarted";

type StartCurdPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const StartCurdPage: NextPageWithLayout<StartCurdPageProps> = ({}) => {
  const { currentDairyBatch, setCurrentDairyBatch } = useProducerContext();

  if (!currentDairyBatch) {
    return <BatchError />;
  }

  return !currentDairyBatch.curdInitDateTime ? (
    <StartCurd
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
StartCurdPage.getLayout = (page: ReactElement) => (
  <MobileLayout>{page}</MobileLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale || "es", ["common"])),
    },
  };
};

export default StartCurdPage;
