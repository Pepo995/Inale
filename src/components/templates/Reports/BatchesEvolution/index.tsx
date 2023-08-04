import React from "react";

import { Card, CardContent } from "@atoms/Card";
import LineChart from "@atoms/LineChart";
import Typography from "@atoms/Typography";
import { Alert } from "@atoms/Alert";
import Loading from "@pages/Loading";
import { toast } from "react-hot-toast";

import { api } from "@utils";
import { useTranslate } from "@hooks";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const BatchesEvolution = () => {
  const { t } = useTranslate();
  const { data, isLoading } = api.batches.getBatchesPerMonth.useQuery();

  if (isLoading) return <Loading />;

  if (!data || !data.success || !data.batches) {
    toast.custom((toastElement) => (
      <Alert alertVariant="error" onClose={() => toast.remove(toastElement.id)}>
        {t(data?.translationKey ?? "errors.default")}
      </Alert>
    ));
    return null;
  }

  const date = new Date();

  return (
    <Card className="w-full">
      <CardContent className="pt-3">
        <Typography variant="h3" weight="semibold" color="bgSecondary">
          {t("reports.batchesPerMonth")}
        </Typography>
        <LineChart
          labels={Array.from({ length: 12 }, (_, index) => {
            const now = new Date();
            return format(now.setMonth(now.getMonth() - 11 + index), "MMM", {
              locale: es,
            });
          })}
          datasets={[
            {
              label: t("reports.batchesAmount"),
              data: Array.from(
                { length: 12 },
                (_, index) =>
                  data.batches[(date.getMonth() + index + 1) % 12] ?? 0
              ),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default BatchesEvolution;
