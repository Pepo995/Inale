import React, { useState } from "react";
import Typography from "@atoms/Typography";
import { useTranslate } from "@hooks";
import type { DairyForm, DairyWithProducerAndEmployees } from "@types";
import { Button } from "@atoms/Button";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import DairyInfoCard from "@molecules/DairyInfoCard";
import DairyEmployeesCard from "@templates/DairyEmployeesCard";
import DairyCheeseTypesCard, {
  type CheeseTypeShownProps,
} from "@templates/DairyCheeseTypesCard";

import { api } from "@utils";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";
import { updateDairyFormSchema } from "@schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";
import {
  convertDairyFromForm,
  convertDairyToForm,
  convertEmployeesFromTable,
  convertEmployeesToTable,
  convertDairyCheeseTypesToTable,
  convertToDairyCheeseTypesFromForm,
} from "@utils";
type DairyProps = { dairy: DairyWithProducerAndEmployees };

const Dairy = ({ dairy }: DairyProps) => {
  const { t } = useTranslate();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const [employeesToRestore, setEmployeesToRestore] = useState(
    convertEmployeesToTable(dairy.employees)
  );

  const [employeesShown, setEmployeesShown] = useState(employeesToRestore);

  const [cheeseTypesToRestore, setCheeseTypesToRestore] = useState<
    CheeseTypeShownProps[]
  >(convertDairyCheeseTypesToTable(dairy.cheeseTypes));

  const [cheeseTypesShown, setCheeseTypesShown] =
    useState(cheeseTypesToRestore);

  const [showingDeleted, setShowingDeleted] = useState(false);

  const methods = useForm<DairyForm>({
    mode: "onSubmit",
    resolver: zodResolver(updateDairyFormSchema),
    defaultValues: convertDairyToForm(dairy),
  });

  const updateDairyInfoMutation = api.dairies.updateDairyInfo.useMutation();

  const updateDairyInfo = async (
    dairyInfo: z.infer<typeof updateDairyFormSchema>
  ) => {
    const result = await updateDairyInfoMutation.mutateAsync({
      ...convertDairyFromForm(dairy.rut, dairyInfo),
      employees: convertEmployeesFromTable(employeesShown, dairy.rut),
      cheeseTypes: convertToDairyCheeseTypesFromForm(
        cheeseTypesShown,
        dairy.rut
      ),
    });

    if (!result.success) {
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
          {t(
            result.updatedDairy
              ? "dairies.dairyUpdated"
              : result.translationKey ?? "errors.undefined"
          )}
        </Alert>
      ),
      { position: "bottom-right" }
    );

    setIsEditing(false);

    if (result.updatedDairy) {
      methods.reset(convertDairyToForm(result.updatedDairy));
      setEmployeesToRestore(
        convertEmployeesToTable(result.updatedDairy.employees)
      );
      setCheeseTypesToRestore(
        convertDairyCheeseTypesToTable(result.updatedDairy.cheeseTypes)
      );
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mb-2 flex w-full items-center justify-between">
        <Button
          type="button"
          variant="default"
          onClick={() => void router.push("/dairies")}
        >
          <ArrowLeft />
        </Button>
        <div className="mr-auto">
          <Typography variant="h2" weight="semibold">
            {methods.getValues().name}
          </Typography>
          {methods.getValues().enabledSince && (
            <Typography variant="h4">
              {t("dairies.enabledSince", {
                date: methods.getValues().enabledSince,
              })}
            </Typography>
          )}
        </div>
        {!isEditing ? (
          <Button
            type="button"
            variant="tertiary"
            onClick={() => setIsEditing(true)}
          >
            {t("dairies.editProfile")}
          </Button>
        ) : (
          <>
            <Button
              type="button"
              variant="cancel"
              onClick={() => {
                setIsEditing(false);
                methods.reset();
                setEmployeesShown(employeesToRestore);
                setCheeseTypesShown(cheeseTypesToRestore);
                setShowingDeleted(false);
              }}
            >
              {t("revertChanges")}
            </Button>
            <div className="ml-2">
              <Button
                type="button"
                variant="tertiary"
                onClick={() => {
                  void methods.handleSubmit(updateDairyInfo)();
                  setShowingDeleted(false);
                }}
              >
                {t("save")}
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="flex w-full gap-4">
        <div className="w-1/3">
          <FormProvider {...methods}>
            <form>
              <DairyInfoCard
                isEditing={isEditing}
                producerName={dairy.producer?.name ?? undefined}
                rut={dairy.rut}
                dairyInfo={methods.getValues()}
              />
            </form>
          </FormProvider>
        </div>
        <div className="flex w-2/3 flex-col gap-4">
          <DairyCheeseTypesCard
            dairy={dairy}
            cheeseTypesShown={cheeseTypesShown}
            setCheeseTypesShown={setCheeseTypesShown}
            isEditing={isEditing}
            showingDeleted={showingDeleted}
            setShowingDeleted={setShowingDeleted}
          />
          <DairyEmployeesCard
            dairy={dairy}
            isEditing={isEditing}
            employeesShown={employeesShown}
            setEmployeesShown={setEmployeesShown}
          />
        </div>
      </div>
    </div>
  );
};

export default Dairy;
