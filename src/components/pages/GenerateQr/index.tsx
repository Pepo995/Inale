import CreateBatches, { type FormValues } from "@organisms/CreateBatches";

import { useTranslate } from "@hooks";
import Typography from "@atoms/Typography";
import { Alert } from "@atoms/Alert";

import React from "react";
import { Button } from "@atoms/Button";
import { Card, CardContent, CardHeader } from "@atoms/Card";
import { FormProvider, useForm, useFieldArray } from "react-hook-form";
import { api } from "@utils";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import toast from "react-hot-toast";

import QRCode from "qrcode";

import type { FormatedDateDairy } from "@types";

type GenerateQrProps = {
  dairies: FormatedDateDairy[];
};

const GenerateQR = ({ dairies }: GenerateQrProps) => {
  const { t } = useTranslate();

  const methods = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: {
      selectedDairies: [{ batchAmount: "1" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "selectedDairies",
  });

  const watchedDairies = methods.watch("selectedDairies");
  const selectedDairies = fields.map((selectedDairies, index) => ({
    ...selectedDairies,
    ...watchedDairies[index],
  }));

  const createBatchesMutation = api.batches.createBatches.useMutation();

  const allDairies = dairies.map((dairy) => ({
    label: dairy.name,
    id: dairy.rut.toString(),
  }));

  const generateQRCodes = async () => {
    const batchesInfo = selectedDairies
      .filter((selectedDairy) => selectedDairy.rut !== undefined)
      .map((selectedDairy) => ({
        amount: Number(selectedDairy.batchAmount),
        dairyRut: Number(selectedDairy.rut),
      }));

    if (batchesInfo.length === 0) {
      return toast.custom(
        (toastElement) => (
          <Alert
            alertVariant="error"
            onClose={() => toast.remove(toastElement.id)}
          >
            {t("generateQr.noDairySelected")}
          </Alert>
        ),
        { position: "bottom-right" }
      );
    }

    const { success, ...createBatchesResponse } =
      await createBatchesMutation.mutateAsync({
        batches: batchesInfo,
      });

    if (!success) {
      return toast.custom(
        (toastElement) => (
          <Alert
            alertVariant="error"
            onClose={() => toast.remove(toastElement.id)}
          >
            {t(createBatchesResponse.translationKey ?? "errors.default")}
          </Alert>
        ),
        { position: "bottom-right" }
      );
    }

    const zip = new JSZip();

    for (const dairyRut in createBatchesResponse.createdBatches) {
      const urlsCodes = createBatchesResponse.createdBatches[dairyRut];

      if (urlsCodes) {
        const qrCodeFolder = zip.folder(dairyRut);
        for (const [
          index,
          {
            url,
            tagKeys: { dairyName, batchNumber },
          },
        ] of urlsCodes.entries()) {
          const canvas = await QRCode.toCanvas(url);

          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = "black";
            ctx.font = "bold 12px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(
              t("generateQr.qrTag", {
                dairyName,
                batchNumber,
              }),
              canvas.width / 2,
              2
            );
          }

          const dataUrl = canvas.toDataURL("image/png");

          qrCodeFolder?.file(
            `${index + 1}.png`,
            dataUrl.replace("data:image/png;base64,", ""),
            {
              base64: true,
            }
          );
        }
      }
    }

    return await zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "qrs.zip");
    });
  };

  return (
    <div className="flex w-full flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <Typography variant="h2" weight="semibold">
            {t("generateQr.generateQr")}
          </Typography>
        </div>
        <Button
          variant="tertiary"
          size="lg"
          type="submit"
          onClick={methods.handleSubmit(generateQRCodes)}
        >
          {t("generateQr.downloadQr")}
        </Button>
      </div>
      <Card>
        <CardHeader>{t("generateQr.description")}</CardHeader>
        <CardContent>
          {allDairies.length ? (
            <FormProvider {...methods}>
              <form>
                <CreateBatches
                  dairyOptions={allDairies}
                  key="createQrBatches"
                  selectedDairies={selectedDairies}
                  addDairy={append}
                  removeDairy={remove}
                />
              </form>
            </FormProvider>
          ) : (
            <Typography weight="semibold">
              {t("emptyStates.noDairies")}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateQR;
