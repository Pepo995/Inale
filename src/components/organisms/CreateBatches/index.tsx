import React from "react";
import { Button } from "@atoms/Button";
import SelectDropdown from "@molecules/Dropdown";
import { FormTextInput } from "@atoms/TextInput";
import Typography from "@atoms/Typography";

import {
  type UseFieldArrayAppend,
  type UseFieldArrayRemove,
} from "react-hook-form";
import { Alert } from "@atoms/Alert";
import toast from "react-hot-toast";
import { useTranslate } from "@hooks";
import { Trash } from "lucide-react";

type DairyInfo = { label: string; id: string };

type SelectableDairy = {
  rut?: string;
  batchAmount: string;
};

export type FormValues = {
  selectedDairies: SelectableDairy[];
};

type CreateBatchesProps = {
  dairyOptions: DairyInfo[];
  selectedDairies: (SelectableDairy & { id: string })[];
  addDairy: UseFieldArrayAppend<FormValues, "selectedDairies">;
  removeDairy: UseFieldArrayRemove;
};

const CreateBatches = ({
  dairyOptions,
  selectedDairies,
  addDairy,
  removeDairy,
}: CreateBatchesProps) => {
  const { t } = useTranslate();

  const notSelectedDairies = dairyOptions.filter(
    (dairy) =>
      !selectedDairies.some((innerDairy) => innerDairy.rut === dairy.id)
  );

  return (
    <div className="flex flex-col gap-y-9">
      <div className="grid grid-cols-2 gap-x-16 gap-y-4">
        <Typography variant="h3" weight="semibold">
          {t("generateQr.dairyName")}
        </Typography>
        <Typography variant="h3" weight="semibold">
          {t("generateQr.batchQuantity")}
        </Typography>
        <div className="col-span-2 h-[1px] w-full bg-gray-400" />
        {selectedDairies.map((selectedDairy, index) => {
          const options = [...notSelectedDairies];

          const selectedOption = dairyOptions.find(
            (dairyOption) => dairyOption.id === selectedDairy.rut
          );
          if (selectedOption) options.unshift(selectedOption); // Adding the current selected option at the beginning.

          return (
            <React.Fragment key={selectedDairy.id}>
              <div className="flex w-64 items-center">
                <SelectDropdown
                  options={options}
                  placeholder={t("selectDairy")}
                  name={`selectedDairies.${index}.rut`}
                />
              </div>
              <div
                className="flex items-center gap-2"
                key={`batchGenerateQr-${index}`}
              >
                <div className="w-20">
                  <FormTextInput
                    type="number"
                    min={1}
                    name={`selectedDairies.${index}.batchAmount`}
                    defaultValue={1}
                    sizeVariant="md"
                    variant="default"
                  />
                </div>
                <Typography text="center">
                  {t("generateQr.batchTotal")}
                </Typography>
                {index !== 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    buttonColor="tertiary"
                    onClick={() => removeDairy(index)}
                    className="ml-auto"
                  >
                    <Trash className="text-slate-500" width={18} />
                  </Button>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div className="flex w-full justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          buttonColor="tertiary"
          onClick={() => {
            if (selectedDairies.length !== dairyOptions.length) {
              addDairy({ batchAmount: "1" });
            } else {
              toast.custom(
                (tElement) => (
                  <Alert
                    alertVariant="error"
                    onClose={() => toast.remove(tElement.id)}
                  >
                    {t("generateQr.dairyLimit")}
                  </Alert>
                ),
                { position: "bottom-right" }
              );
            }
          }}
        >
          {t("generateQr.addDairy")}
        </Button>
      </div>
    </div>
  );
};

export default CreateBatches;
