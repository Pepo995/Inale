import React, {
  type ReactElement,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";

import type { NextPageWithLayout } from "../_app";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  api,
  formatDate,
  formatTime,
  generateForgotStepBatchUpdateData as updateData,
  mapRouteFromStep,
} from "@utils";
import { useProducerContext, useTranslate } from "@hooks";
import { useRouter } from "next/router";

import Confirmation from "@pages/mobile/ForgotStep/confirmation";
import ForgotStepForm from "@pages/mobile/ForgotStep";
import Layout from "@templates/mobile/Layout";
import Typography from "@atoms/Typography";

import { useForm, FormProvider } from "react-hook-form";
import { ForgotStep } from "@types";
import { forgotStepSchema as schema } from "@schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import BatchError from "@pages/mobile/BatchError";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";

type ForgotStepProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const ForgotStep: NextPageWithLayout<ForgotStepProps> = () => {
  const { t } = useTranslate();
  const [saved, setSaved] = useState(false);
  const { currentDairyBatch, setCurrentDairyBatch } = useProducerContext();
  const updateBatchStepsMutation = api.batches.updateBatchSteps.useMutation();

  const router = useRouter();

  const defaultValues = useMemo(() => {
    if (!currentDairyBatch) return {};
    return {
      initialVolume: currentDairyBatch.initialVolume
        ? String(currentDairyBatch.initialVolume)
        : undefined,
      curdInitDate: formatDate(currentDairyBatch.curdInitDateTime),
      curdInitTime: formatTime(currentDairyBatch.curdInitDateTime),
      curdInProgress: false,
      curdEndDate: formatDate(currentDairyBatch.curdEndDateTime),
      curdEndTime: formatTime(currentDairyBatch.curdEndDateTime),
      betweenCurdAndSalting: false,
      weightBeforeSalting: currentDairyBatch.weightBeforeSalting
        ? String(currentDairyBatch.weightBeforeSalting)
        : undefined,
      saltingInitDate: formatDate(currentDairyBatch.saltingInitDateTime),
      saltingInitTime: formatTime(currentDairyBatch.saltingInitDateTime),
      saltingInProgress: false,
      maturationInitDate: formatDate(currentDairyBatch.maturationInitDateTime),
      maturationInitTime: formatTime(currentDairyBatch.maturationInitDateTime),
      maturationInProgress: false,
      maturationEndDate: formatDate(currentDairyBatch.maturationEndDateTime),
      weightAfterMaturation: currentDairyBatch.weightAfterMaturation
        ? String(currentDairyBatch.weightAfterMaturation)
        : undefined,
    };
  }, [currentDairyBatch]);

  const methods = useForm<ForgotStep>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    methods.reset(defaultValues);
  }, [methods, defaultValues]);

  const [
    curdInProgress,
    saltingInProgress,
    betweenCurdAndSalting,
    maturationInProgress,
  ] = methods.watch([
    "curdInProgress",
    "saltingInProgress",
    "betweenCurdAndSalting",
    "maturationInProgress",
  ]);

  const resetEndMaturation = useCallback(() => {
    methods.resetField("maturationEndDate");
    methods.resetField("maturationEndTime");
    methods.resetField("weightAfterMaturation");
    methods.clearErrors();
  }, [methods]);

  const resetInitMaturation = useCallback(() => {
    methods.resetField("maturationInitDate");
    methods.resetField("maturationInitTime");
    methods.resetField("maturationInProgress");
    resetEndMaturation();
  }, [methods, resetEndMaturation]);

  const resetInitSalting = useCallback(() => {
    methods.resetField("weightBeforeSalting");
    methods.resetField("saltingInitDate");
    methods.resetField("saltingInitTime");
    methods.resetField("saltingInProgress");
    resetInitMaturation();
  }, [methods, resetInitMaturation]);

  const resetEndCurd = useCallback(() => {
    methods.resetField("curdEndDate");
    methods.resetField("curdEndTime");
    methods.resetField("betweenCurdAndSalting");
    resetInitSalting();
  }, [methods, resetInitSalting]);

  useEffect(() => {
    if (curdInProgress) resetEndCurd();
  }, [curdInProgress, methods, resetEndCurd]);

  useEffect(() => {
    if (betweenCurdAndSalting) resetInitSalting();
  }, [betweenCurdAndSalting, methods, resetInitSalting]);

  useEffect(() => {
    if (saltingInProgress) resetInitMaturation();
  }, [saltingInProgress, methods, resetInitMaturation]);

  useEffect(() => {
    if (maturationInProgress) resetEndMaturation();
  }, [maturationInProgress, methods, resetEndMaturation]);

  const onSubmit = async (values: ForgotStep) => {
    try {
      const result = await updateBatchStepsMutation.mutateAsync(
        updateData(values, currentDairyBatch)
      );

      if (!result.success || !result.updatedBatch) {
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
      }

      if (result.success && result.updatedBatch && currentDairyBatch) {
        setCurrentDairyBatch({ ...currentDairyBatch, ...result.updatedBatch });
        await router.push(
          `/producer/${mapRouteFromStep(result.updatedBatch.currentStep)}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  return currentDairyBatch ? (
    <div className="flex flex-col">
      <Typography variant="h4" weight="semibold">
        {t("dairy")}: {currentDairyBatch.dairy.name}
      </Typography>
      <div className="flex items-center justify-center p-6">
        <Typography variant="h6" weight="medium">
          {t("table.batch")} {currentDairyBatch.batchName}:{" "}
          {t("forgotStep.title")}
        </Typography>
      </div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          {saved ? (
            <Confirmation
              onCancel={() => setSaved(false)}
              currentDairyBatch={currentDairyBatch}
            />
          ) : (
            <ForgotStepForm onSave={() => setSaved(true)} />
          )}
        </form>
      </FormProvider>
    </div>
  ) : (
    <BatchError />
  );
};

ForgotStep.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(context.locale || "es", ["common"])),
    },
  };
};

export default ForgotStep;
