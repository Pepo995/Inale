import React from "react";
import Typography from "@atoms/Typography";
import { Button } from "@atoms/Button";
import { api, formatDate } from "@utils";
import { FormProvider, useForm } from "react-hook-form";

import SelectDropdown from "@molecules/Dropdown";
import { Alert } from "@atoms/Alert";
import { toast } from "react-hot-toast";
import BatchError from "./BatchError";
import { useProducerContext } from "@hooks";
import { FormTextInput } from "@atoms/TextInput";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslate } from "@hooks";
import type { BatchWithDairy, DairyCheeseType } from "@types";
import { useRouter } from "next/router";

type StartBatchProps = {
  onBatchStarted: (batch: BatchWithDairy) => void;
  cheeseTypes: DairyCheeseType[];
};

const StartBatch = ({ onBatchStarted, cheeseTypes }: StartBatchProps) => {
  const { t } = useTranslate();
  const { currentDairyBatch } = useProducerContext();
  const router = useRouter();

  const batchSchema = z.object({
    batchName: z.string().optional(),
    cheeseTypeName: z.string({
      required_error: t("startBatch.required"),
    }),
  });

  const now = new Date();
  const date = formatDate(now) as string;
  const prefix = now.getHours() >= 12 ? "T" : "M";

  const methods = useForm<z.infer<typeof batchSchema>>({
    mode: "onSubmit",
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batchName: `${prefix}-${date}`,
      cheeseTypeName: cheeseTypes[0]?.cheeseTypeName ?? "",
    },
  });

  const mutation = api.batches.startBatch.useMutation();

  if (!currentDairyBatch) return <BatchError />;

  const buttonText = t("startBatch.start");

  return (
    <div className="me-auto ms-auto flex flex-col gap-16 md:w-1/2">
      <Typography weight="normal" variant="h4" color="gray">
        {t("dairy")} {currentDairyBatch.dairy.name}
      </Typography>
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Typography variant="h6" weight="medium">
          {t("startBatch.newQrIdentified")}
        </Typography>
        <Typography variant="h6" text="center">
          {t("startBatch.description")}
          {cheeseTypes.length > 1
            ? t("startBatch.descriptionPart2A")
            : t("startBatch.descriptionPart2B", { buttonText })}
        </Typography>
      </div>
      <div>
        <FormProvider {...methods}>
          <form className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Typography variant="h6" weight="medium">
                {t("startBatch.batchName")}
              </Typography>
              <FormTextInput type="text" name="batchName" className="h-10" />
            </div>
            {cheeseTypes.length > 1 ? (
              <div className="flex flex-col gap-2">
                <Typography variant="h6" weight="medium">
                  {t("cheeseType")}
                </Typography>
                <SelectDropdown
                  placeholder={t("inputs.selectOption")}
                  categoryLabel="Tipos"
                  name="cheeseTypeName"
                  options={cheeseTypes.map((item) => ({
                    id: item.cheeseTypeName,
                    label: item.cheeseTypeName,
                  }))}
                />
              </div>
            ) : (
              <div className="flex justify-between">
                <Typography variant="h6" weight="medium">
                  {t("cheeseType")}
                </Typography>
                <Typography variant="h6">
                  {methods.getValues().cheeseTypeName}
                </Typography>
              </div>
            )}
            <div className="mt-14 flex flex-col gap-4">
              <Button
                variant="tertiary"
                size="lg"
                type="submit"
                onClick={methods.handleSubmit(async (values) => {
                  const result = await mutation.mutateAsync({
                    batchId: currentDairyBatch.id,
                    cheeseTypeName: values.cheeseTypeName,
                    batchName: values.batchName as string,
                  });

                  if (!result.success || !result.batch?.started) {
                    return toast.custom(
                      (toastElement) => (
                        <Alert
                          alertVariant="error"
                          onClose={() => toast.remove(toastElement.id)}
                        >
                          {t("startBatch.error")}
                        </Alert>
                      ),
                      { position: "bottom-right" }
                    );
                  }
                  onBatchStarted(result.batch);
                })}
              >
                {buttonText}
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

export default StartBatch;
