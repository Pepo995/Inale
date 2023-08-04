import React, { useState } from "react";

import { Card, CardContent } from "@atoms/Card";
import BarChart from "@atoms/BarChart";
import Typography from "@atoms/Typography";
import { Alert } from "@atoms/Alert";
import { Button } from "@atoms/Button";
import SelectDropdown from "@molecules/Dropdown";
import Loading from "@pages/Loading";
import { toast } from "react-hot-toast";

import { api } from "@utils";
import { useTranslate } from "@hooks";
import * as z from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { SensorReadsCount } from "@types";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const DairySensorRates = () => {
  const { t } = useTranslate();
  const [fetchNewSensorRates, setFetchNewSensorRates] = React.useState(false);
  const [sensorRates, setSensorRates] = useState<SensorReadsCount | null>(null);

  const schema = z.object({
    dairy: z.string({ required_error: "Selecciona una quesería, por favor" }),
  });

  type Form = z.infer<typeof schema>;

  const methods = useForm<Form>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  const [dairy] = methods.watch(["dairy"]);

  api.dairies.countLastWeekSensorReadsByDairy.useQuery(parseInt(dairy), {
    onSuccess: (data) => {
      setFetchNewSensorRates(false);
      if (!data.success || !data.sensorReads) {
        toast.custom((toastElement) => (
          <Alert
            alertVariant="error"
            onClose={() => toast.remove(toastElement.id)}
          >
            {t(data?.translationKey ?? "errors.default")}
          </Alert>
        ));
        return null;
      }
      setSensorRates(data.sensorReads);
    },
    onError: () => {
      setFetchNewSensorRates(false);
      toast.custom((toastElement) => (
        <Alert
          alertVariant="error"
          onClose={() => toast.remove(toastElement.id)}
        >
          {t("errors.default")}
        </Alert>
      ));
      setSensorRates(null);
    },
    enabled: fetchNewSensorRates,
  });

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
    setFetchNewSensorRates(true);
  };

  const date = new Date();

  return (
    <Card className="w-full">
      <CardContent className="pt-3">
        <Typography variant="h3" weight="semibold" color="bgSecondary">
          <div className="inline-flex w-full items-center justify-between">
            {t("reports.sensorReadsInPastSevenDays")}
            <FormProvider {...methods}>
              <form
                onSubmit={methods.handleSubmit(onSubmit)}
                className="inline-flex items-center gap-x-1"
              >
                <SelectDropdown
                  name="dairy"
                  options={dairyNameRut}
                  placeholder={t("selectDairy")}
                />
                <Button type="submit">
                  <ArrowRight className="cursor-pointer" />
                </Button>
              </form>
            </FormProvider>
          </div>
        </Typography>
        {sensorRates ? (
          <BarChart
            labels={Array.from({ length: 7 }, (_, index) => {
              const now = new Date();
              return format(
                now.setDate(now.getDate() - 6 + index),
                "EEE dd/MM",
                {
                  locale: es,
                }
              );
            })}
            datasets={[
              {
                label: t("reports.curdReads"),
                data: Array.from(
                  { length: 7 },
                  (_, index) =>
                    sensorRates[(date.getDay() + index + 1) % 7]?.curd ?? 0
                ),
              },
              {
                label: t("reports.saltingReads"),
                data: Array.from(
                  { length: 7 },
                  (_, index) =>
                    sensorRates[(date.getDay() + index + 1) % 7]?.salting ?? 0
                ),
              },
              {
                label: t("reports.maturationReads"),
                data: Array.from(
                  { length: 7 },
                  (_, index) =>
                    sensorRates[(date.getDay() + index + 1) % 7]?.maturation ??
                    0
                ),
              },
            ]}
          />
        ) : (
          <div className="mx-12 flex h-32 items-center">
            <Typography text="center" variant="h3">
              {t("emptyStates.noSensorReadsYet")}
            </Typography>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DairySensorRates;
