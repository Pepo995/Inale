import React from "react";
import { Card, CardContent } from "@atoms/Card";
import { CheckCircle2, Clock3, AlertTriangle } from "lucide-react";
import type { BatchWithDairy } from "@types";
import { useTranslate } from "@hooks";
import { useRouter } from "next/router";
import Typography from "@atoms/Typography";
import { Button } from "@atoms/Button";

const CertifiedBatchCard = ({ batch }: { batch: BatchWithDairy }) => {
  const { t } = useTranslate();
  const router = useRouter();

  let cardContent;
  switch (batch.certified) {
    case "WaitingReview":
      cardContent = {
        Icon: Clock3,
        title: t("certification.waitingReview.title"),
        description: t("certification.waitingReview.description"),
      };
      break;
    case "SuccessfullyCertified":
      cardContent = {
        Icon: CheckCircle2,
        title: t("certification.sucessfullyCertified.title"),
        description: t("certification.sucessfullyCertified.description"),
        buttonText: t("certification.sucessfullyCertified.button"),
      };
      break;
    case "CertificationFailed":
      cardContent = {
        Icon: AlertTriangle,
        title: t("certification.certificationFailed.title"),
        description: t("certification.certificationFailed.description"),
        buttonText: t("certification.certificationFailed.button"),
      };
      break;
  }

  return (
    <Card className="flex w-full flex-col p-8">
      <CardContent>
        <div className="flex flex-col items-center gap-4 text-center">
          {cardContent.Icon && (
            <div className="inline-flex items-center">
              <cardContent.Icon />
            </div>
          )}
          <Typography weight="semibold">{cardContent.title}</Typography>
          <Typography text="center">{cardContent.description}</Typography>
          {cardContent.buttonText && (
            <Button
              type="button"
              onClick={() =>
                void router.push(`../certification-result/${batch.id}`)
              }
            >
              {cardContent.buttonText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CertifiedBatchCard;
