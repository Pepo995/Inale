import React from "react";
import { useTranslate } from "@hooks";
import Typography from "@atoms/Typography";
import { CheckCircle2 } from "lucide-react";

type BatchWaitingReviewProps = {
  batchName: string | null;
};

const BatchWaitingReview = ({ batchName }: BatchWaitingReviewProps) => {
  const { t } = useTranslate();

  return (
    <div className="flex flex-col items-center justify-center gap-12">
      <div className="flex flex-col items-center gap-4">
        <CheckCircle2 className="mx-auto" />
        {batchName ? (
          <Typography variant="h6" weight="medium" text="center">
            {t("finishBatch.batchFinished", {
              batchName,
            })}
          </Typography>
        ) : (
          <Typography variant="h6" weight="medium" text="center">
            {t("batch")}
          </Typography>
        )}
      </div>
      <Typography variant="h6" text="center">
        {t("certification.waitingReview.willBeChecked")}
      </Typography>
    </div>
  );
};

export default BatchWaitingReview;
