import React from "react";
import Typography from "@atoms/Typography";
import { useTranslate } from "@hooks";
import { Button } from "@atoms/Button";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import type { BatchWithDairy } from "@types";
import CertifiedBatchCard from "@templates/CertifiedBatchCard";
import BatchInfoCard from "@templates/BatchInfoCard";
import BatchStagesCard from "@templates/BatchStagesCard";

type BatchProps = { batch: BatchWithDairy };

const Batch = ({ batch }: BatchProps) => {
  const { t } = useTranslate();
  const router = useRouter();

  return (
    <div className="flex w-full flex-col gap-10">
      <div className="flex w-full items-center justify-between">
        <Button
          type="button"
          variant="default"
          onClick={() => void router.push("/batches")}
        >
          <ArrowLeft />
        </Button>
        <div className="mr-auto flex gap-2">
          <Typography variant="h2" weight="semibold">
            {t("batchNumber")}
          </Typography>
          <Typography variant="h2" weight="bold">
            {batch.id}
          </Typography>
        </div>
      </div>
      <div className="flex flex-col gap-8 md:flex-row">
        <div className="flex gap-8 md:w-6/12 md:flex-col">
          <BatchInfoCard batch={batch} />
          <CertifiedBatchCard batch={batch} />
        </div>
        <BatchStagesCard batch={batch} />
      </div>
    </div>
  );
};

export default Batch;
