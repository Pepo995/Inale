import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@atoms/Card";
import { useTranslate } from "@hooks";
import { FormTextInput } from "@atoms/TextInput";
import Typography from "@atoms/Typography";

type CheeseTypeParametersCardProps = {
  isEditing?: boolean;
  isCreating?: boolean;
  name?: number;
  producerName?: string;
};
const CheeseTypeParametersCard = ({
  isCreating = false,
  isEditing = false,
}: CheeseTypeParametersCardProps) => {
  const { t } = useTranslate();
  const disabled = !isCreating && !isEditing;
  const variant = disabled ? "disabled" : "form";

  const tableContainerClass = "grid grid-cols-3 gap-y-2 gap-x-28 pb-3";
  return (
    <Card className="flex w-full flex-col">
      <CardHeader>
        <CardTitle className="font-Inter">
          {t("cheeseTypes.elaborationProcess")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {/* Curd */}
        <Card className="flex w-full flex-col bg-primary">
          <CardHeader>
            <CardTitle className="font-Inter">{t("step.Curd")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={tableContainerClass}>
              <Typography variant="text">
                {t("cheeseTypes.variable")}
              </Typography>
              <Typography variant="text" text="center">
                {t("cheeseTypes.minValue")}
              </Typography>
              <Typography variant="text" text="right">
                {t("cheeseTypes.maxValue")}
              </Typography>

              <div className="col-span-full border-b-2" />

              <Typography variant="text" display="row" textHeight="full">
                {t("cheeseTypes.temperature")}
              </Typography>
              <FormTextInput
                type="number"
                name="minCurdTemperature"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.degrees")}
                labelFormat="reverse"
              />
              <FormTextInput
                type="number"
                name="maxCurdTemperature"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.degrees")}
                labelFormat="reverse"
              />

              <Typography variant="text" display="row" textHeight="full">
                {t("cheeseTypes.time")}
              </Typography>
              <FormTextInput
                type="number"
                name="minCurdMinutes"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.hours")}
                labelFormat="reverse"
              />
              <FormTextInput
                type="number"
                name="maxCurdMinutes"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.hours")}
                labelFormat="reverse"
              />
            </div>
          </CardContent>
        </Card>

        {/* Salting */}
        <Card className="flex w-full flex-col bg-primary">
          <CardHeader>
            <CardTitle className="font-Inter">{t("step.Salting")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={tableContainerClass}>
              <Typography variant="text" display="row" textHeight="full">
                {t("cheeseTypes.variable")}
              </Typography>
              <Typography variant="text" text="center">
                {t("cheeseTypes.minValue")}
              </Typography>
              <Typography variant="text" text="right">
                {t("cheeseTypes.maxValue")}
              </Typography>

              <div className="col-span-full border-b-2" />

              <Typography variant="text" display="row" textHeight="full">
                {t("cheeseTypes.salinity")}
              </Typography>
              <FormTextInput
                type="number"
                name="minSaltingSalinity"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.salinityUnit")}
                labelFormat="reverse"
              />
              <FormTextInput
                type="number"
                name="maxSaltingSalinity"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.salinityUnit")}
                labelFormat="reverse"
              />

              <Typography variant="text" display="row" textHeight="full">
                {t("cheeseTypes.time")}
              </Typography>
              <FormTextInput
                type="number"
                name="minSaltingMinutes"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.hours")}
                labelFormat="reverse"
              />
              <FormTextInput
                type="number"
                name="maxSaltingMinutes"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.hours")}
                labelFormat="reverse"
              />
            </div>
          </CardContent>
        </Card>

        {/* Maturation */}
        <Card className="flex w-full flex-col bg-primary">
          <CardHeader>
            <CardTitle className="font-Inter">{t("step.Maturation")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={tableContainerClass}>
              <Typography variant="text">
                {t("cheeseTypes.variable")}
              </Typography>
              <Typography variant="text" text="center">
                {t("cheeseTypes.minValue")}
              </Typography>
              <Typography variant="text" text="right">
                {t("cheeseTypes.maxValue")}
              </Typography>

              <div className="col-span-full border-b-2" />

              <Typography variant="text" display="row" textHeight="full">
                {t("cheeseTypes.temperature")}
              </Typography>
              <FormTextInput
                type="number"
                name="minMaturationTemperature"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.degrees")}
                labelFormat="reverse"
              />
              <FormTextInput
                type="number"
                name="maxMaturationTemperature"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.degrees")}
                labelFormat="reverse"
              />

              <Typography variant="text" display="row" textHeight="full">
                {t("cheeseTypes.humidity")}
              </Typography>
              <FormTextInput
                type="number"
                name="minMaturationHumidity"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.percentage")}
                labelFormat="reverse"
              />
              <FormTextInput
                type="number"
                name="maxMaturationHumidity"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.percentage")}
                labelFormat="reverse"
              />

              <Typography variant="text" display="row" textHeight="full">
                {t("cheeseTypes.time")}
              </Typography>
              <FormTextInput
                type="number"
                name="minMaturationMinutes"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.hours")}
                labelFormat="reverse"
              />
              <FormTextInput
                type="number"
                name="maxMaturationMinutes"
                disabled={disabled}
                variant={variant}
                label={t("cheeseTypes.hours")}
                labelFormat="reverse"
              />
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default CheeseTypeParametersCard;
