import { useFormContext } from "react-hook-form";
import { useTranslate } from "@hooks";
import type { BatchWithDairy, ForgotStep } from "@types";
import {
  generateForgotStepBatchUpdateData as updateData,
  batchCurrentStep,
} from "@utils";

import Typography from "@atoms/Typography";
import { Button } from "@atoms/Button";

const Confirmation = ({
  onCancel,
  currentDairyBatch,
}: {
  onCancel: () => void;
  currentDairyBatch: BatchWithDairy;
}) => {
  const { t } = useTranslate();
  const methods = useFormContext<ForgotStep>();

  const currentStep = batchCurrentStep(
    updateData(methods.getValues(), currentDairyBatch)
  );
  const batchNameToShow = currentDairyBatch.batchName
    ? currentDairyBatch.batchName
    : currentDairyBatch.id;

  return (
    <div className="flex flex-col gap-y-12">
      <div className="flex flex-col gap-y-5">
        <Typography text="center">
          {currentStep !== "Finished"
            ? t("forgotStep.confirmation.please", {
                batch: batchNameToShow,
                step: t(`step.${currentStep}`),
              })
            : t("forgotStep.confirmation.pleaseFinished", {
                batch: batchNameToShow,
              })}
        </Typography>
        <Typography text="center">
          {t("forgotStep.confirmation.systemCheck")}
        </Typography>
      </div>
      <div className="flex flex-col gap-y-4">
        <Button variant="tertiary" size="sm" type="submit">
          {t("forgotStep.confirmation.confirm")}
        </Button>
        <Button onClick={onCancel} variant="tertiaryLighter">
          {t("forgotStep.confirmation.cancel")}
        </Button>
      </div>
    </div>
  );
};

export default Confirmation;
