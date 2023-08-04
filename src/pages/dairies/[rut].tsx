import React from "react";
import type { ReactElement } from "react";

import Layout from "@templates/desktop/Layout";

import type { NextPageWithLayout } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Typography from "@atoms/Typography";
import { api } from "@utils";

import { useRouter } from "next/router";
import Dairy from "@pages/Dairy";
import { useTranslate } from "@hooks";
import Loading from "@pages/Loading";

type DairyPageProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const DairyPage: NextPageWithLayout<DairyPageProps> = () => {
  const {
    query: { rut },
  } = useRouter();
  const { t } = useTranslate();

  const { isLoading, data: result } =
    typeof rut === "string"
      ? api.dairies.getDairyByRut.useQuery({ rut: parseInt(rut) })
      : { isLoading: false, data: { success: false } };

  if (isLoading) return <Loading />;

  if (!result || !result.success || !result.dairy)
    return (
      <Typography>
        {t(result?.translationKey ?? "dairies.errorLoadingDairy")}
      </Typography>
    );

  return (
    <div className="flex">
      <Dairy dairy={result.dairy} />
    </div>
  );
};

DairyPage.getLayout = (page: ReactElement) => <Layout>{page}</Layout>;

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default DairyPage;
