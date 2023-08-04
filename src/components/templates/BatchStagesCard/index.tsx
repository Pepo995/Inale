import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@atoms/Card";
import type { BatchWithDairy } from "@types";
import { useTranslate } from "@hooks";
import Typography from "@atoms/Typography";
import { api, formatDateTime } from "@utils";
import Loading from "@pages/Loading";
import { formatToStringTime, formatToTimeRange } from "@utils";

const BatchStagesCard = ({ batch }: { batch: BatchWithDairy }) => {
  const { t } = useTranslate();

  const { isLoading, data: result } = api.batches.getBatchSensorReads.useQuery({
    id: batch.id,
  });

  if (isLoading) return <Loading />;

  if (!result || !result.success || !result.batchSensorData)
    return (
      <Typography>
        {t(result?.translationKey ?? "errors.batchNotFound")}
      </Typography>
    );

  const { batchSensorData: sensorData } = result;

  const tableContainerClass = "grid grid-cols-3 gap-y-2 pb-3";

  return (
    <Card className="flex w-full flex-col">
      <CardHeader>
        <CardTitle className="font-Inter">
          {t("batchStagesCard.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {/* Curd */}
        <Card className="flex w-full flex-col bg-primary">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="font-Inter">
                {t("batchStagesCard.curd")}
              </CardTitle>
              <Typography>
                {sensorData.curdInitDateTime
                  ? formatDateTime(sensorData.curdInitDateTime)
                  : t("undefined")}
              </Typography>
            </div>
          </CardHeader>
          <CardContent>
            <div className={tableContainerClass}>
              <Typography variant="text">
                {t("batchStagesCard.variable")}
              </Typography>
              <Typography variant="text" text="center">
                {t("batchStagesCard.result")}
              </Typography>
              <Typography variant="text" text="right">
                {t("batchStagesCard.range")}
              </Typography>

              <div className="col-span-full border-b-2" />

              <Typography variant="text" textHeight="full">
                {t("cheeseTypes.temperature")}
              </Typography>
              <Typography text="center">
                {sensorData.averageTemperatureInCurd
                  ? sensorData.averageTemperatureInCurd.toFixed(2)
                  : t("undefined")}
              </Typography>
              <Typography text="right">{`${
                sensorData.cheeseType.minCurdTemperature
              }${t("cheeseTypes.degrees")} - ${
                sensorData.cheeseType.maxCurdTemperature
              }${t("cheeseTypes.degrees")}`}</Typography>

              <Typography variant="text" textHeight="full">
                {t("cheeseTypes.time")}
              </Typography>
              <Typography text="center">
                {sensorData.diffCurdMinutes
                  ? formatToStringTime(sensorData.diffCurdMinutes)
                  : t("undefined")}
              </Typography>
              <Typography text="right">
                {formatToTimeRange(
                  sensorData.cheeseType.minCurdMinutes,
                  sensorData.cheeseType.maxCurdMinutes
                )}
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Salinity */}
        <Card className="flex w-full flex-col bg-primary">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="font-Inter">
                {t("batchStagesCard.salting")}
              </CardTitle>
              <Typography>
                {sensorData.saltingInitDateTime
                  ? formatDateTime(sensorData.saltingInitDateTime)
                  : t("undefined")}
              </Typography>
            </div>
          </CardHeader>
          <CardContent>
            <div className={tableContainerClass}>
              <Typography variant="text">
                {t("batchStagesCard.variable")}
              </Typography>
              <Typography variant="text" text="center">
                {t("batchStagesCard.result")}
              </Typography>
              <Typography variant="text" text="right">
                {t("batchStagesCard.range")}
              </Typography>

              <div className="col-span-full border-b-2" />

              <Typography variant="text" textHeight="full">
                {t("cheeseTypes.salinity")}
              </Typography>
              <Typography text="center">
                {sensorData.averageSalinityInSalting
                  ? sensorData.averageSalinityInSalting.toFixed(2)
                  : t("undefined")}
              </Typography>
              <Typography text="right">{`${
                sensorData.cheeseType.minSaltingSalinity
              }${t("cheeseTypes.salinityUnit")} - ${
                sensorData.cheeseType.maxSaltingSalinity
              }${t("cheeseTypes.salinityUnit")}`}</Typography>

              <Typography variant="text" textHeight="full">
                {t("cheeseTypes.time")}
              </Typography>
              <Typography text="center">
                {sensorData.diffSaltingMinutes
                  ? formatToStringTime(sensorData.diffSaltingMinutes)
                  : t("undefined")}
              </Typography>
              <Typography text="right">
                {formatToTimeRange(
                  sensorData.cheeseType.minSaltingMinutes,
                  sensorData.cheeseType.maxSaltingMinutes
                )}
              </Typography>
            </div>
          </CardContent>
        </Card>

        {/* Maturation */}
        <Card className="flex w-full flex-col bg-primary">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle className="font-Inter">
                {t("batchStagesCard.maturation")}
              </CardTitle>
              <Typography>
                {sensorData.maturationInitDateTime
                  ? formatDateTime(sensorData.maturationInitDateTime)
                  : t("undefined")}
              </Typography>
            </div>
          </CardHeader>
          <CardContent>
            <div className={tableContainerClass}>
              <Typography variant="text">
                {t("batchStagesCard.variable")}
              </Typography>
              <Typography variant="text" text="center">
                {t("batchStagesCard.result")}
              </Typography>
              <Typography variant="text" text="right">
                {t("batchStagesCard.range")}
              </Typography>

              <div className="col-span-full border-b-2" />

              <Typography variant="text" textHeight="full">
                {t("cheeseTypes.humidity")}
              </Typography>
              <Typography text="center">
                {sensorData.averageHumidityInMaturation
                  ? sensorData.averageHumidityInMaturation.toFixed(2)
                  : t("undefined")}
              </Typography>
              <Typography text="right">{`${
                sensorData.cheeseType.minMaturationHumidity
              }${t("cheeseTypes.percentage")} - ${
                sensorData.cheeseType.maxMaturationHumidity
              }${t("cheeseTypes.percentage")}`}</Typography>

              <Typography variant="text" textHeight="full">
                {t("cheeseTypes.temperature")}
              </Typography>
              <Typography text="center">
                {sensorData.averageTemperatureInMaturation
                  ? sensorData.averageTemperatureInMaturation.toFixed(2)
                  : t("undefined")}
              </Typography>
              <Typography text="right">{`${
                sensorData.cheeseType.minMaturationTemperature
              }${t("cheeseTypes.degrees")} - ${
                sensorData.cheeseType.maxMaturationTemperature
              }${t("cheeseTypes.degrees")}`}</Typography>

              <Typography variant="text" textHeight="full">
                {t("cheeseTypes.time")}
              </Typography>
              <Typography text="center">
                {sensorData.diffMaturationMinutes
                  ? formatToStringTime(sensorData.diffMaturationMinutes)
                  : t("undefined")}
              </Typography>
              <Typography text="right">
                {formatToTimeRange(
                  sensorData.cheeseType.minMaturationMinutes,
                  sensorData.cheeseType.maxMaturationMinutes
                )}
              </Typography>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default BatchStagesCard;
