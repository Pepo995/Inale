import React from "react";

import Loading from "@pages/Loading";
import { Card, CardContent } from "@atoms/Card";
import Typography from "@atoms/Typography";
import { Alert } from "@atoms/Alert";
import BarChart from "@atoms/BarChart";

import { toast } from "react-hot-toast";
import { api } from "@utils";
import { useTranslate } from "@hooks";

const CheeseTypesWeightStats = () => {
  const { t } = useTranslate();
  const { data, isLoading } = api.batches.getCheeseTypesWeightStats.useQuery();

  if (isLoading) return <Loading />;

  if (!data || !data.success || !data.weightStats) {
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
          {t("reports.volumeAndWeightVariation")}
        </Typography>
        <BarChart
          labels={data.weightStats.map((stats) => stats.cheeseType)}
          datasets={[
            {
              label: t("reports.initialVolume"),
              data: data.weightStats.map((stats) =>
                Number(stats.avgInitialVolume.toFixed(1))
              ),
            },
            {
              label: t("reports.weightAfterPress"),
              data: data.weightStats.map((stats) =>
                Number(stats.avgWeightAfterPress.toFixed(1))
              ),
            },
            {
              label: t("reports.finalWeight"),
              data: data.weightStats.map((stats) =>
                Number(stats.avgFinalWeight.toFixed(1))
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default CheeseTypesWeightStats;
