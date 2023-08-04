import type { ReactElement } from "react";

import Layout from "@templates/desktop/Layout";

import CertificationsRate from "@templates/Reports/CertificationsRate";
import BatchesEvolution from "@templates/Reports/BatchesEvolution";
import CheeseTypesWeightStats from "@templates/Reports/CheeseTypesWeightStats";
import DairySensorRates from "@templates/Reports/DairySensorRates";
import DairyLocationReport from "@templates/Reports/DairyLocationReport";

import Typography from "@atoms/Typography";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@atoms/Tabs";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import type { NextPageWithLayout } from "./_app";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { useTranslate } from "@hooks";
import CertificationFailedReport from "@templates/Reports/CertificationFailedReport";

type ReportsProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Header = () => {
  const { t } = useTranslate();
  return (
    <Typography variant="h2" weight="semibold" color="bgSecondary">
      {t("reports.reports")}
    </Typography>
  );
};

const Reports: NextPageWithLayout<ReportsProps> = () => {
  const { t } = useTranslate();
  return (
    <Tabs
      defaultValue="certificationsRate"
      className="flex flex-col items-start justify-start"
    >
      <TabsList className="flex justify-between">
        <TabsTrigger value="certificationsRate">
          {t("reports.certifications")}
        </TabsTrigger>
        <TabsTrigger value="batchesEvolution">
          {t("reports.batches")}
        </TabsTrigger>
        <TabsTrigger value="cheeseTypesWeightStats">
          {t("reports.weight")}
        </TabsTrigger>
        <TabsTrigger value="sensorReadings">
          {t("reports.sensorReadings")}
        </TabsTrigger>
        <TabsTrigger value="location">{t("reports.location")}</TabsTrigger>
        <TabsTrigger value="failedCertifications">
          {t("reports.failedCertifications")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="certificationsRate" className="w-full md:w-1/2">
        <CertificationsRate />
      </TabsContent>
      <TabsContent value="batchesEvolution" className="w-full md:w-2/3">
        <BatchesEvolution />
      </TabsContent>
      <TabsContent value="cheeseTypesWeightStats" className="w-full md:w-2/3">
        <CheeseTypesWeightStats />
      </TabsContent>
      <TabsContent value="sensorReadings" className="w-full md:w-2/3">
        <DairySensorRates />
      </TabsContent>
      <TabsContent value="location" className="w-full md:w-2/3">
        <DairyLocationReport />
      </TabsContent>
      <TabsContent value="failedCertifications" className="w-full md:w-2/3">
        <CertificationFailedReport />
      </TabsContent>
    </Tabs>
  );
};

Reports.getLayout = function getLayout(page: ReactElement) {
  return <Layout header={<Header />}>{page}</Layout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default Reports;
