import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@atoms/Card";
import { type CheeseTypePageInfo } from "@types";
import { useTranslate } from "@hooks";
import { FormTextInput, TextInput } from "@atoms/TextInput";
import Typography from "@atoms/Typography";
import FileInput from "@atoms/S3FileInput";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";
import { FileIcon } from "lucide-react";
import Link from "next/link";
import { useFormContext } from "react-hook-form";

type CheeseTypeInfoCardProps = {
  isEditing?: boolean;
  isCreating?: boolean;
  name?: number;
  producerName?: string;
};
const CheeseTypeInfoCard = ({
  isCreating = false,
  isEditing = false,
}: CheeseTypeInfoCardProps) => {
  const { t } = useTranslate();
  const disabled = !isCreating && !isEditing;

  const methods = useFormContext<CheeseTypePageInfo>();

  const [bromatologicalForm, registrationCode] = methods.watch([
    "bromatologicalForm",
    "registrationCode",
  ]);

  return (
    <Card className="flex h-min w-2/5 flex-col">
      <CardHeader className="flex-row items-center">
        <CardTitle className="w-full font-Inter">
          {t("cheeseTypes.productInfo")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <>
            <div className="w-1/2">
              <Typography variant="text">{t("cheeseTypes.name")}</Typography>
            </div>
            <FormTextInput type="text" name="name" />
          </>
        )}

        <Typography variant="text">
          {t("cheeseTypes.registrationCode")}
        </Typography>
        {!disabled ? (
          <FormTextInput type="text" name="registrationCode" />
        ) : (
          <TextInput
            type="text"
            defaultValue={registrationCode ?? t("undefined")}
            disabled
            variant="disabled"
          />
        )}

        <Typography variant="text">
          {t("cheeseTypes.bromatologicalForm")}
        </Typography>
        <div className="mb-2">
          {bromatologicalForm ? (
            <Link
              href={bromatologicalForm}
              className="flex w-full justify-center rounded-md bg-tertiary p-3"
            >
              <Typography color="tertiary" display="row">
                <FileIcon size={16} className="my-auto mr-2" />
                {t("cheeseTypes.bromatologicalFormFileName")}
              </Typography>
            </Link>
          ) : (
            <div className="flex w-full cursor-default justify-center bg-secondary p-3">
              <Typography variant="text" color="secondary" text="center">
                {t("cheeseTypes.bromatologicalFormNotDefined")}
              </Typography>
            </div>
          )}
        </div>
        {!disabled && (
          <FileInput
            id="bromatologicalForm"
            name="bromatologicalForm"
            acceptedExtensions="application/pdf"
            onFileUploaded={() => {
              toast.custom(
                (toastElement) => (
                  <Alert
                    alertVariant="success"
                    onClose={() => toast.remove(toastElement.id)}
                  >
                    {t("fileUploaded")}
                  </Alert>
                ),
                { position: "bottom-right" }
              );
            }}
            onError={() =>
              toast.custom(
                (toastElement) => (
                  <Alert
                    alertVariant="error"
                    onClose={() => toast.remove(toastElement.id)}
                  >
                    {t("errors.default")}
                  </Alert>
                ),
                { position: "bottom-right" }
              )
            }
            uploadFileText={t("cheeseTypes.uploadFile")}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CheeseTypeInfoCard;
