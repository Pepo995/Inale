import React from "react";
import Typography from "@atoms/Typography";
import { Button } from "@atoms/Button";
import { CheckCircle2 } from "lucide-react";
import { useProducerContext } from "@hooks";
import { BatchInfo } from "@atoms/BatchInfo";
import { useTranslate } from "@hooks";
import Loading from "@pages/Loading";
import { useRouter } from "next/router";

const CurdFinished = () => {
  const { t } = useTranslate();
  const router = useRouter();

  const { currentDairyBatch } = useProducerContext();

  if (!currentDairyBatch) {
    return <Loading />;
  }

  return (
    <div className="me-auto ms-auto flex flex-col gap-16 md:w-1/2">
      <Typography weight="normal" variant="h4" color="gray">
        {t("dairy")} {currentDairyBatch.dairy.name}
      </Typography>
      <div className="flex flex-col items-center gap-8">
        <div className="flex w-2/3 flex-col gap-2">
          <CheckCircle2 className="mx-auto" />
          <Typography variant="h6" weight="medium" text="center">
            {t("finishCurd.curdFinished")}
          </Typography>
        </div>
        <BatchInfo batch={currentDairyBatch} />
      </div>
      <div className="flex flex-col gap-4">
        <Button
          variant="tertiaryLighter"
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

export default CurdFinished;
