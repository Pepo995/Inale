import React from "react";
import Typography from "@atoms/Typography";
import { Button } from "@atoms/Button";
import { CheckCircle2 } from "lucide-react";

import { api } from "@utils";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";
import { BatchInfo } from "@atoms/BatchInfo";
import BatchError from "@pages/mobile/BatchError";
import { useProducerContext } from "@hooks";
import { useRouter } from "next/router";
import type { BatchWithDairy } from "@types";
import { FormProvider, useForm } from "react-hook-form";
import { FormTextInput } from "@atoms/TextInput";
import { useTranslate } from "@hooks";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { initialVolumeSchema } from "@schemas";

type StartCurdProps = {
  showSuccessfullyCreated?: boolean;
  onCurdStarted: (newBatch: BatchWithDairy) => void;
};

const StartCurd = ({
  showSuccessfullyCreated = false,
  onCurdStarted,
}: StartCurdProps) => {
  const { t } = useTranslate();
  const { currentDairyBatch } = useProducerContext();
  const router = useRouter();

  const methods = useForm<z.infer<typeof initialVolumeSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(initialVolumeSchema),
  });

  const startCurdMutation = api.batches.startCurd.useMutation();

  if (!currentDairyBatch) return <BatchError />;

  return (
    <div className="me-auto ms-auto flex flex-col gap-16 md:w-1/2">
      <Typography weight="normal" variant="h4" color="gray">
        {t("dairy")} {currentDairyBatch.dairy.name}
      </Typography>
      <div className="flex flex-col items-center gap-8">
        {showSuccessfullyCreated ? (
          <>
            <CheckCircle2 />
            <Typography variant="h6" weight="medium">
              {t("startCurd.batchStarted", {
                batch: currentDairyBatch?.batchName,
              })}
            </Typography>
            <Typography variant="h6">{t("startCurd.description")}</Typography>
          </>
        ) : (
          <>
            <div className="flex w-2/3 flex-col gap-2">
              <CheckCircle2 className="mx-auto" />
              <Typography variant="h6" weight="medium" text="center">
                {t("qrSuccessful")}
              </Typography>
              <Typography variant="h6" text="center">
                {t("batchIdentified", {
                  batch: currentDairyBatch?.batchName,
                })}
              </Typography>
            </div>
            <BatchInfo batch={currentDairyBatch} />
          </>
        )}
        <FormProvider {...methods}>
          <form className="flex  w-full flex-col gap-16">
            <div className="flex items-center justify-between">
              <Typography variant="h6" weight="semibold">
                {t("startBatch.volumeText")}
              </Typography>
              <FormTextInput
                placeholder={t("startBatch.volumePlaceholder")}
                type="number"
                name="initialVolume"
              />
            </div>

            <div className="flex flex-col gap-4">
              <Button
                variant="tertiary"
                size="lg"
                type="submit"
                onClick={methods.handleSubmit(async (values) => {
                  const result = await startCurdMutation.mutateAsync({
                    batchId: currentDairyBatch.id,
                    initialVolume:
                      values.initialVolume === ""
                        ? undefined
                        : parseInt(values.initialVolume as string),
                  });
                  if (!result.success || !result.batch)
                    return toast.custom(
                      (toastElement) => (
                        <Alert
                          alertVariant="error"
                          onClose={() => toast.remove(toastElement.id)}
                        >
                          {t("startCurd.error")}
                        </Alert>
                      ),
                      { position: "bottom-right" }
                    );

                  onCurdStarted(result.batch);
                })}
              >
                {t("startCurd.start")}
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
    </div>
  );
};

export default StartCurd;
