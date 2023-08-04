import React from "react";
import type { BatchWithDairy } from "@types";
import { useTranslate } from "@hooks";
import Typography from "@atoms/Typography";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import BatchWaitingReview from "@molecules/BatchWaitingReview";
import { formatDateTime } from "@utils";

const CertificationStatus = ({
  batch,
  isAdmin = false,
}: {
  batch: BatchWithDairy;
  isAdmin?: boolean;
}) => {
  const { t } = useTranslate();

  if (batch.certified === "WaitingReview")
    return <BatchWaitingReview batchName={batch.batchName} />;
  const cardContent =
    batch.certified === "SuccessfullyCertified"
      ? {
          description: t(
            "certification.certificationResult.certifiedDescription"
          ),
          certificationDate: t(
            "certification.certificationResult.certificationDate"
          ),
        }
      : {
          description: t(
            "certification.certificationResult.notCertifiedDescription"
          ),
        };

  return (
    <div className="m-auto mt-2 flex flex-col items-center gap-16 px-5 py-12 sm:w-96 sm:shadow-lg">
      <div className="inline-flex items-center">
        {batch.certified === "SuccessfullyCertified" ? (
          <CheckCircle2 width={50} height={50} />
        ) : (
          <AlertTriangle width={50} height={50} />
        )}
      </div>
      <div className=" flex flex-col items-center gap-6 text-center">
        <Typography variant="h2" weight="semibold">
          {t("certification.certificationResult.title")}
        </Typography>
        <Typography text="center">{cardContent.description}</Typography>
        <div className="flex w-full flex-col gap-6">
          <div className="flex justify-between">
            <Typography>{t("cheeseType")}</Typography>
            <Typography>{batch.cheeseTypeName}</Typography>
          </div>
          <div className="flex justify-between">
            <Typography>
              {t("certification.certificationResult.producedBy")}
            </Typography>
            <Typography>{batch.dairy.name}</Typography>
          </div>
          {cardContent.certificationDate && (
            <div className="flex justify-between">
              <Typography>{cardContent.certificationDate}</Typography>
              <Typography>
                {formatDateTime(batch.maturationEndDateTime)}
              </Typography>
            </div>
          )}
          {isAdmin && batch.certified === "CertificationFailed" && (
            <div className="flex flex-col justify-between">
              <Typography>
                {t("certification.certificationFailed.reasonForFailure")}
              </Typography>
              {batch.certificationMessages ? (
                <ul className="flex h-36 list-disc flex-col items-start overflow-scroll px-10">
                  {batch.certificationMessages.map(
                    (certificationFail, index) => (
                      <li key={index}>
                        <Typography>{certificationFail.message}</Typography>
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <Typography>
                  {t("certification.certificationFailed.undefinedReason")}
                </Typography>
              )}
            </div>
          )}
        </div>
      </div>
      <Image
        alt="INALE"
        src="https://inale-public-files.s3.us-east-2.amazonaws.com/01_INALE_Marca%20%283%29.png"
        width={200}
        height={100}
      />
    </div>
  );
};

export default CertificationStatus;
