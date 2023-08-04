import React from "react";

import { Card, CardContent } from "@atoms/Card";
import PieChart from "@atoms/PieChart";
import Typography from "@atoms/Typography";
import { Alert } from "@atoms/Alert";
import Loading from "@pages/Loading";
import { toast } from "react-hot-toast";

import { api } from "@utils";
import { useTranslate } from "@hooks";

const CertifcationsRate = () => {
  const { t } = useTranslate();
  const { data, isLoading } = api.batches.getBatchesStats.useQuery();

  if (isLoading) return <Loading />;

  if (!data || !data.success || !data.stats) {
    toast.custom((toastElement) => (
      <Alert alertVariant="error" onClose={() => toast.remove(toastElement.id)}>
        {t(data?.translationKey ?? "errors.default")}
      </Alert>
    ));
    return null;
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-3">
        <Typography variant="h3" weight="semibold" color="bgSecondary">
          {t("reports.batchesPerCertification")}
        </Typography>
        <PieChart
          labels={[t("reports.certified"), t("reports.notCertified")]}
          datasets={[
            {
              label: t("reports.batchesAmount"),
              data: [data.stats.batchesCertified, data.stats.batchesFailed],
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default CertifcationsRate;
