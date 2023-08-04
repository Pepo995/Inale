import React from "react";
import Typography from "@atoms/Typography";
import { Button } from "@atoms/Button";
import { AlertTriangle } from "lucide-react";
import { useTranslate } from "@hooks";
import { useRouter } from "next/router";

const BatchError = () => {
  const { t } = useTranslate();
  const router = useRouter();

  return (
    <div className="me-auto ms-auto flex flex-col gap-16 md:w-1/2">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle />
        <Typography variant="h4">{t("errors.invalidQR")}</Typography>
      </div>
      <div className="flex flex-col gap-4">
        <Button
          variant="tertiary"
          size="lg"
          type="button"
          onClick={() => void router.push("/producer")}
        >
          {t("backToStart")}
        </Button>
      </div>
    </div>
  );
};

export default BatchError;
