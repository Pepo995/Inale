import React from "react";
import Typography from "@atoms/Typography";
import { Button } from "@atoms/Button";
import { CheckCircle2 } from "lucide-react";
import { useProducerContext } from "@hooks";
import { FormProvider, useForm } from "react-hook-form";
import { api } from "@utils";
import BatchError from "@pages/mobile/BatchError";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";
import { BatchInfo } from "@atoms/BatchInfo";
import { useRouter } from "next/router";
import { FormTextInput } from "@atoms/TextInput";
import { useTranslate } from "@hooks";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { weightAfterMaturationSchema } from "@schemas";

const FinishBatch = () => {
  const { t } = useTranslate();
  const { currentDairyBatch, setCurrentDairyBatch } = useProducerContext();
  const router = useRouter();

  const methods = useForm<z.infer<typeof weightAfterMaturationSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(weightAfterMaturationSchema),
  });

  const finishBatchMutation = api.batches.finishBatch.useMutation();

  if (!currentDairyBatch) return <BatchError />;

  return (
    <div className="me-auto ms-auto flex flex-col gap-16 md:w-1/2">
      <Typography weight="normal" variant="h4" color="gray">
        {t("dairy")} {currentDairyBatch.dairy.name}
      </Typography>
      <div className="flex flex-col items-center gap-8">
        <div className="flex w-2/3 flex-col gap-2">
          <CheckCircle2 className="mx-auto" />
          <Typography variant="h6" weight="medium" text="center">
            {t("finishBatch.step", { batch: currentDairyBatch.batchName })}
          </Typography>
        </div>
        <BatchInfo batch={currentDairyBatch} />
      </div>
      <FormProvider {...methods}>
        <form className="flex w-full flex-col gap-16">
          <div className="flex items-center justify-between">
            <Typography variant="h6" weight="semibold">
              {t("finishBatch.weight")}
            </Typography>
            <FormTextInput
              placeholder={t("finishBatch.weightPlaceholder")}
              type="number"
              name="weightAfterMaturation"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Button
              variant="tertiary"
              size="lg"
              type="submit"
              onClick={methods.handleSubmit(async (values) => {
                const result = await finishBatchMutation.mutateAsync({
                  batchId: currentDairyBatch.id,
                  weightAfterMaturation:
                    values.weightAfterMaturation === ""
                      ? undefined
                      : parseInt(values.weightAfterMaturation as string),
                });
                if (!result.success)
                  return toast.custom(
                    (toastElement) => (
                      <Alert
                        alertVariant="error"
                        onClose={() => toast.remove(toastElement.id)}
                      >
                        {t(result.translationKey ?? "errors.default")}
                      </Alert>
                    ),
                    { position: "bottom-right" }
                  );

                setCurrentDairyBatch({
                  ...currentDairyBatch,
                  ...result.batch,
                });
              })}
            >
              {t("finishBatch.finish")}
            </Button>
            <Button
              variant="tertiary"
              size="lg"
              type="submit"
              onClick={(event) => {
                event.preventDefault();
                void router.push("/producer/forgot-step");
              }}
            >
              {t("step.forgot")}
            </Button>
            <Button
              variant="tertiaryLighter"
              size="lg"
              type="button"
              onClick={() => void router.push("/producer")}
            >
              {t("backToStart")}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default FinishBatch;
