import React, { type ReactElement } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import type { NextPageWithLayout } from "../_app";
import MobileLayout from "@templates/mobile/Layout";
import Typography from "@atoms/Typography";
import { useTranslate } from "@hooks";
import { QrCode } from "lucide-react";

type ProducerHomeProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const ProducerHome: NextPageWithLayout<ProducerHomeProps> = () => {
  const { t } = useTranslate();

  return (
    <div className="flex flex-col items-center justify-center gap-12">
      <QrCode size={100} />
      <Typography text="center" variant="h2">
        {t("producerStart.welcome")}
      </Typography>
      <Typography text="center" variant="h3">
        {t("producerStart.ifNoQrCode")}
      </Typography>
    </div>
  );
};

ProducerHome.getLayout = (page: ReactElement) => (
  <MobileLayout>{page}</MobileLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default ProducerHome;
