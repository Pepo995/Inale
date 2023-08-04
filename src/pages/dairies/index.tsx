import React from "react";
import type { ReactElement } from "react";

import Layout from "@templates/desktop/Layout";
import Dairies from "@pages/Dairies";
import type { NextPageWithLayout } from "../_app";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Typography from "@atoms/Typography";
import { api, convertDairyFromCreateForm } from "@utils";
import { useTranslate } from "@hooks";
import { Modal } from "@molecules/Modal";
import DairyInfoCard from "@molecules/DairyInfoCard";
import { FormProvider, useForm } from "react-hook-form";
import { type DairyCreateForm } from "@types";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { createDairyFormSchema } from "@schemas";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";
import { useRouter } from "next/router";
import { Button } from "@atoms/Button";
import Loading from "@pages/Loading";

type ProducersPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
>;

const Header = () => {
  const { t } = useTranslate();
  const router = useRouter();

  const methods = useForm<DairyCreateForm>({
    mode: "onSubmit",
    resolver: zodResolver(createDairyFormSchema),
  });

  const createDairyMutation = api.dairies.createDairy.useMutation();

  const createDairy = async (
    dairyInfo: z.infer<typeof createDairyFormSchema>
  ) => {
    const result = await createDairyMutation.mutateAsync(
      convertDairyFromCreateForm(parseInt(dairyInfo.rut), dairyInfo)
    );

    if (!result.success || !result.createdDairy) {
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

    toast.custom(
      (toastElement) => (
        <Alert
          alertVariant="success"
          onClose={() => toast.remove(toastElement.id)}
        >
          {t("dairies.dairyCreated")}
        </Alert>
      ),
      { position: "bottom-right" }
    );
    void router.push(`/dairies/${result.createdDairy.rut}`);
  };
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-between">
        <Typography variant="h2" weight="semibold">
          {t("dairies.list")}
        </Typography>
      </div>
      <Modal
        title={t("dairies.create")}
        triggerButton={
          <Button variant="tertiary">{t("dairies.createDairy")}</Button>
        }
        confirmButtonText={t("dairies.create")}
        cancelButtonText={t("cancel")}
        onConfirm={async () => {
          /**
           * Preventing autoclose when validation fails.
           */
          let failed = false;
          await methods.handleSubmit(createDairy, () => (failed = true))();
          return failed;
        }}
        showCancelButton
      >
        <div className="h-96 overflow-auto">
          <FormProvider {...methods}>
            <form>
              <DairyInfoCard isCreating />
            </form>
          </FormProvider>
        </div>
      </Modal>
    </div>
  );
};

const ProducersPage: NextPageWithLayout<ProducersPageProps> = () => {
  const { t } = useTranslate();

  const { isLoading, data: result } =
    api.dairies.getAllDairiesWithProducerAndEmployees.useQuery({
      includeDeleted: true,
    });

  if (isLoading) return <Loading />;

  if (!result || !result.success || !result.dairies)
    return <Typography>{t("dairies.errorLoadingDairies")}</Typography>;

  return (
    <div className="flex">
      <Dairies dairies={result.dairies} />
    </div>
  );
};

ProducersPage.getLayout = (page: ReactElement) => (
  <Layout header={<Header />}>{page}</Layout>
);

export const getServerSideProps: GetServerSideProps = async (context) => ({
  props: {
    ...(await serverSideTranslations(context.locale || "es", ["common"])),
  },
});

export default ProducersPage;
