import React, { useState } from "react";

import { Card, CardContent } from "@atoms/Card";
import Typography from "@atoms/Typography";
import { Alert } from "@atoms/Alert";
import { Button } from "@atoms/Button";
import PieChart from "@atoms/PieChart";
import SelectDropdown from "@molecules/Dropdown";
import Loading from "@pages/Loading";
import { toast } from "react-hot-toast";

import { api, formatDate, parseDate } from "@utils";
import { useTranslate } from "@hooks";
import * as z from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { EnumFailTypes } from "@types";
import { ArrowRight } from "lucide-react";
import { FormTextInput } from "@atoms/TextInput";
import { DateValidation } from "@schemas";

const CertificationFailedReport = () => {
  const { t } = useTranslate();
  const [fetchNewFailedReports, setFetchNewFailedReports] = useState(false);
  const [failedCertifications, setFailedCertifications] = useState<
    | {
        failType: EnumFailTypes;
        amount: number;
      }[]
    | null
  >(null);

  const schema = z
    .object({
      dairyRut: z.string({ required_error: t("selectDairy") }),
      minDate: DateValidation,
      maxDate: DateValidation,
    })
    .refine(
      ({ minDate, maxDate }) =>
        (parseDate(minDate) as Date) <= (parseDate(maxDate) as Date),
      {
        message: t("batches.form.error"),
        path: ["minDate"],
      }
    );

  type Form = z.infer<typeof schema>;

  const today = new Date();

  // Subtract one week (7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const initialMinDate = oneWeekAgo;
  const initialMaxDate = today;

  const methods = useForm<Form>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: {
      minDate: formatDate(initialMinDate),
      maxDate: formatDate(initialMaxDate),
    },
  });

  const [dairyRut, minDate, maxDate] = methods.watch([
    "dairyRut",
    "minDate",
    "maxDate",
  ]);

  api.dairies.getCertificationFailsForDairy.useQuery(
    {
      rut: parseInt(dairyRut),
      minDate: parseDate(minDate) as Date,
      maxDate: parseDate(maxDate) as Date,
    },
    {
      onSuccess: (data) => {
        setFetchNewFailedReports(false);
        if (!data.success) {
          return toast.custom((toastElement) => (
            <Alert
              alertVariant="error"
              onClose={() => toast.remove(toastElement.id)}
            >
              {t(data?.translationKey ?? "errors.default")}
            </Alert>
          ));
        }

        if (!data.failedCertifications) {
          return toast.custom((toastElement) => (
            <Alert
              alertVariant="error"
              onClose={() => toast.remove(toastElement.id)}
            >
              {t("errors.default")}
            </Alert>
          ));
        }

        setFailedCertifications(data.failedCertifications);
      },
      onError: () => {
        setFetchNewFailedReports(false);
        toast.custom((toastElement) => (
          <Alert
            alertVariant="error"
            onClose={() => toast.remove(toastElement.id)}
          >
            {t("errors.default")}
          </Alert>
        ));
        setFailedCertifications(null);
      },
      enabled: fetchNewFailedReports,
    }
  );

  const { data, isLoading } = api.dairies.getAllDairies.useQuery();

  if (isLoading) return <Loading />;

  if (!data || !data.success || !data.dairies) {
    toast.custom((toastElement) => (
      <Alert alertVariant="error" onClose={() => toast.remove(toastElement.id)}>
        {t(data?.translationKey ?? "errors.default")}
      </Alert>
    ));
    return null;
  }

  const dairyNameRut = data.dairies.map(({ rut, name }) => ({
    id: rut.toString(),
    label: name,
  }));

  const onSubmit = () => {
    setFetchNewFailedReports(true);
  };

  if (fetchNewFailedReports) return <Loading />;

  return (
    <Card className="w-full">
      <CardContent className="pt-3">
        <Typography variant="h3" weight="semibold" color="bgSecondary">
          <div className="flex w-full flex-col gap-2">
            {t("reports.certificationFailedReport")}
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="inline-flex items-start gap-x-1"
              >
                <SelectDropdown
                  name="dairyRut"
                  options={dairyNameRut}
                  placeholder={t("selectDairy")}
                />
                <FormTextInput
                  name="minDate"
                  type="string"
                  disabled={fetchNewFailedReports}
                  variant={fetchNewFailedReports ? "disabled" : "form"}
                  margin="none"
                />
                <FormTextInput
                  name="maxDate"
                  type="string"
                  disabled={fetchNewFailedReports}
                  variant={fetchNewFailedReports ? "disabled" : "form"}
                  margin="none"
                />
                <Button type="submit">
                  <ArrowRight className="cursor-pointer" />
                </Button>
              </form>
            </FormProvider>
          </div>
        </Typography>
        {failedCertifications && failedCertifications.length > 0 ? (
          <PieChart
            labels={failedCertifications.map(({ failType }) =>
              t(`enumFailType.${failType}`)
            )}
            datasets={[
              {
                label: t("reports.dairyFail"),
                data: failedCertifications.map(({ amount }) => amount),
              },
            ]}
          />
        ) : (
          <div className="mx-12 flex h-32 items-center">
            <Typography text="center" variant="h3">
              {t("emptyStates.noFailedReports")}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CertificationFailedReport;
