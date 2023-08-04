import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@atoms/Card";
import { useTranslate } from "@hooks";
import { FormTextInput, TextInput } from "@atoms/TextInput";
import Typography from "@atoms/Typography";
import { type DairyForm, EnumDepartment } from "@types";
import SelectDropdown from "@molecules/Dropdown";

type DairyInfoCardProps = {
  isEditing?: boolean;
  isCreating?: boolean;
  rut?: number;
  producerName?: string;
  dairyInfo?: DairyForm;
};
const DairyInfoCard = ({
  isCreating = false,
  isEditing = false,
  producerName,
  rut,
  dairyInfo,
}: DairyInfoCardProps) => {
  const { t } = useTranslate();
  const disabled = !isCreating && !isEditing;
  const variant = disabled ? "disabled" : "form";

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center">
        <CardTitle className="w-2/3 font-Inter">
          {t("dairies.companyInfo")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!disabled && (
          <>
            <div className="w-1/2">
              <Typography variant="text">{t("dairies.name")}</Typography>
            </div>
            <FormTextInput type="text" name="name" />
          </>
        )}

        <div className="w-1/2">
          <Typography variant="text">{t("dairies.rut")}</Typography>
        </div>
        {isCreating ? (
          <FormTextInput type="number" name="rut" />
        ) : (
          <TextInput
            type="number"
            defaultValue={rut}
            disabled
            variant="disabled"
          />
        )}

        <div className="w-1/2">
          <Typography variant="text">{t("dairies.companyOwner")}</Typography>
        </div>
        {isCreating ? (
          <FormTextInput type="text" name="producerName" />
        ) : (
          <TextInput
            type="text"
            defaultValue={producerName ?? t("undefined")}
            disabled
            variant="disabled"
          />
        )}

        <div className="w-1/2">
          <Typography variant="text">{t("dairies.department")}</Typography>
        </div>
        {disabled ? (
          <TextInput
            type="text"
            disabled={true}
            variant="disabled"
            defaultValue={t(
              dairyInfo?.department
                ? `departments.${dairyInfo.department}`
                : "undefined"
            )}
          />
        ) : (
          <div className="mb-2">
            <SelectDropdown
              placeholder={t("inputs.selectOption")}
              name="department"
              options={Object.entries(EnumDepartment).map(
                ([branch, value]) => ({
                  id: branch,
                  label: t(`departments.${value}`),
                })
              )}
            />
          </div>
        )}

        <div className="w-1/2">
          <Typography variant="text">{t("dairies.companyNumber")}</Typography>
        </div>
        <FormTextInput
          type="number"
          name="companyNumber"
          disabled={disabled}
          variant={variant}
        />

        <div className="w-1/2">
          <Typography variant="text">
            {t("dairies.registrationCode")}
          </Typography>
        </div>
        <FormTextInput
          type="text"
          name="registrationCode"
          disabled={disabled}
          variant={variant}
        />

        <div className="w-1/2">
          <Typography variant="text">{t("dairies.endorsementDate")}</Typography>
        </div>
        <FormTextInput
          type="text"
          name="endorsementDate"
          disabled={disabled}
          variant={variant}
        />

        <div className="w-1/2">
          <Typography variant="text">
            {t("dairies.bromatologicalRegistry")}
          </Typography>
        </div>
        <FormTextInput
          type="number"
          name="bromatologicalRegistry"
          disabled={disabled}
          variant={variant}
        />

        <div className="w-1/2">
          <Typography variant="text">{t("dairies.dicoseNumber")}</Typography>
        </div>
        <FormTextInput
          type="number"
          name="dicoseNumber"
          disabled={disabled}
          variant={variant}
        />

        <div className="w-1/2">
          <Typography variant="text">{t("dairies.address")}</Typography>
        </div>
        <FormTextInput
          type="text"
          name="address"
          disabled={disabled}
          variant={variant}
        />

        <div className="w-1/2">
          <Typography variant="text">{t("dairies.contactPhone")}</Typography>
        </div>
        <FormTextInput
          type="text"
          name="contactPhone"
          disabled={disabled}
          variant={variant}
        />

        {!disabled && (
          <>
            <div className="w-1/2">
              <Typography variant="text">{t("dairies.enabledDate")}</Typography>
            </div>
            <FormTextInput type="text" name="enabledSince" />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DairyInfoCard;
