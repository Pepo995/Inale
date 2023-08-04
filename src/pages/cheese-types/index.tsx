import React from "react";
import type { ReactElement } from "react";

import Layout from "@templates/desktop/Layout";
import CheeseTypes from "@pages/CheeseTypes";
import type { NextPageWithLayout } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Typography from "@atoms/Typography";
import { api } from "@utils";
import { useTranslate } from "@hooks";
import Loading from "@pages/Loading";
import { Button } from "@atoms/Button";
import { useRouter } from "next/router";

type ProducersPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const Header = () => {
  const { t } = useTranslate();
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-between">
        <Typography variant="h2" weight="semibold">
          {t("cheeseTypes.list")}
        </Typography>
      </div>
      <Button
        variant="tertiary"
        onClick={() => void router.push("/cheese-types/create")}
      >
        {t("cheeseTypes.createCheeseType")}
      </Button>
    </div>
  );
};

const ProducersPage: NextPageWithLayout<ProducersPageProps> = () => {
  const { isLoading, data } = api.cheeseTypes.getAllCheeseTypes.useQuery({
    includeDeleted: true,
  });

  if (isLoading) return <Loading />;

  return (
    <div className="flex">
      <CheeseTypes cheeseTypes={data?.allCheeseTypes} />
    </div>
  );
};

ProducersPage.getLayout = (page: ReactElement) => (
  <Layout header={<Header />}>{page}</Layout>
);

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default ProducersPage;
