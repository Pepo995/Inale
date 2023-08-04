import { useFormContext } from "react-hook-form";
import { useTranslate, useProducerContext } from "@hooks";
import { useRouter } from "next/router";
import type { ForgotStep as ForgotStepType } from "@types";

import ForgotStepFormTemplate from "@templates/mobile/ForgotStepFormTemplate";
import { Button } from "@atoms/Button";

const ForgotStep = ({ onSave }: { onSave: () => void }) => {
  const { t } = useTranslate();
  const router = useRouter();
  const { currentDairyBatch: data } = useProducerContext();
  const methods = useFormContext<ForgotStepType>();

  const [
    curdInitDate,
    curdInitTime,
    curdInProgress,
    curdEndDate,
    curdEndTime,
    betweenCurdAndSalting,
    saltingInitDate,
    saltingInitTime,
    saltingInProgress,
    maturationInitDate,
    maturationInitTime,
    maturationInProgress,
  ] = methods.watch([
    "curdInitDate",
    "curdInitTime",
    "curdInProgress",
    "curdEndDate",
    "curdEndTime",
    "betweenCurdAndSalting",
    "saltingInitDate",
    "saltingInitTime",
    "saltingInProgress",
    "maturationInitDate",
    "maturationInitTime",
    "maturationInProgress",
  ]);

  return (
    <div className="flex flex-col gap-y-3">
      <ForgotStepFormTemplate
        stage="curd"
        disabled={!!data?.curdInitDateTime}
      />
      <ForgotStepFormTemplate
        stage="curdEnd"
        disabled={
          !!data?.curdEndDateTime ||
          !curdInitDate ||
          !curdInitTime ||
          curdInProgress
        }
      />
      <ForgotStepFormTemplate
        stage="salting"
        disabled={
          !!data?.saltingInitDateTime ||
          !curdEndDate ||
          !curdEndTime ||
          betweenCurdAndSalting
        }
      />
      <ForgotStepFormTemplate
        stage="maturation"
        disabled={
          !!data?.maturationInitDateTime ||
          !saltingInitDate ||
          !saltingInitTime ||
          saltingInProgress
        }
      />
      <ForgotStepFormTemplate
        stage="maturationEnd"
        disabled={
          !!data?.maturationEndDateTime ||
          !maturationInitDate ||
          !maturationInitTime ||
          maturationInProgress
        }
      />
      <Button
        type="button"
        onClick={async (event) => {
          event.preventDefault();
          const isValid = await methods.trigger();

          if (isValid) {
            onSave();
          }
        }}
        variant="tertiary"
        size="sm"
      >
        {t("forgotStep.form.save")}
      </Button>
      <Button variant="tertiaryLighter" onClick={router.back}>
        {t("forgotStep.form.cancel")}
      </Button>
    </div>
  );
};

export default ForgotStep;
