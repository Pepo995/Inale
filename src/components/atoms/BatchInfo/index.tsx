import React from "react";
import type { BatchWithDairy } from "@types";
import Typography from "@atoms/Typography";
import { formatDate, formatTime } from "@utils";
import { useTranslate } from "@hooks";

const BatchInfo = ({ batch }: { batch: BatchWithDairy }) => {
  const { t } = useTranslate();
  return (
    <div className="mx-2 flex w-full flex-col gap-4">
      <div className="flex justify-between">
        <Typography variant="h6" weight="semibold">
          {t("cheeseType")}
        </Typography>
        <Typography variant="h6">
          {batch.dairyCheeseType.cheeseTypeName}
        </Typography>
      </div>
      {batch.currentStep && (
        <div className="flex justify-between">
          <Typography variant="h6" weight="semibold">
            {t("batchInfo.step")}
          </Typography>
          <Typography variant="h6">{t(`step.${batch.currentStep}`)}</Typography>
        </div>
      )}
      {batch.currentStepDateTime && (
        <div className="flex justify-between">
          <Typography variant="h6" weight="semibold">
            {t("batchInfo.startDate")}
          </Typography>
          <Typography variant="h6">
            {formatDate(batch.currentStepDateTime)}{" "}
            {formatTime(batch.currentStepDateTime)}
          </Typography>
        </div>
      )}
    </div>
  );
};

BatchInfo.displayName = "BatchInfo";

export { BatchInfo };
