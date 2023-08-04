import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@atoms/Card";
import type { BatchWithDairy } from "@types";
import { useTranslate } from "@hooks";
import Typography from "@atoms/Typography";
import { formatDateTime } from "@utils";

const BatchInfoCard = ({ batch }: { batch: BatchWithDairy }) => {
  const { t } = useTranslate();

  return (
    <Card className="flex w-full flex-col p-8">
      <CardHeader>
        <CardTitle>{t("batchInfoCard.title")}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col items-baseline gap-4">
          <div className="flex w-full justify-between">
            <Typography weight="semibold">
              {t("batchInfoCard.batchNumber")}
            </Typography>
            <Typography>{batch.id}</Typography>
          </div>
          <div className="flex w-full justify-between">
            <Typography weight="semibold">
              {t("batchInfoCard.beginDate")}
            </Typography>
            {batch.curdInitDateTime ? (
              <Typography text="right">
                {formatDateTime(batch.curdInitDateTime)}
              </Typography>
            ) : (
              <Typography text="right">{t("step.NotStarted")}</Typography>
            )}
          </div>
          <div className="flex w-full justify-between">
            <Typography weight="semibold">{t("dairy")}</Typography>
            <Typography>{batch.dairy.name}</Typography>
          </div>
          <div className="flex w-full justify-between">
            <Typography weight="semibold">
              {t("batchInfoCard.cheese")}
            </Typography>
            <Typography>{batch.cheeseTypeName}</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BatchInfoCard;
