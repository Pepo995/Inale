import React, { useState } from "react";
import Typography from "@atoms/Typography";
import { useTranslate } from "@hooks";
import { Button } from "@atoms/Button";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";
import { api, convertCheeseTypeFromPage } from "@utils";
import { CheeseType, type CheeseTypePageInfo } from "@types";

import { convertCheeseTypeToPage } from "@utils";
import { cheeseTypePageValidator } from "@schemas";
import CheeseTypeInfoCard from "@molecules/CheeseTypeInfoCard";
import CheeseTypeParametersCard from "@molecules/CheeseTypeParametersCard";

type CheeseProps = { cheeseType: CheeseType; isCreating?: boolean };

const CheeseType = ({ cheeseType, isCreating = false }: CheeseProps) => {
  const { t } = useTranslate();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(isCreating);

  const methods = useForm<CheeseTypePageInfo>({
    mode: "onSubmit",
    resolver: zodResolver(cheeseTypePageValidator),
    defaultValues: convertCheeseTypeToPage(cheeseType),
  });

  const saveMutation = isCreating
    ? api.cheeseTypes.createCheeseType.useMutation()
    : api.cheeseTypes.updateCheeseType.useMutation();

  const saveChanges = async (
    cheeseInfo: z.infer<typeof cheeseTypePageValidator>
  ) => {
    const result = await saveMutation.mutateAsync(
      convertCheeseTypeFromPage(cheeseInfo)
    );

    if (!result.success || !result.cheeseType) {
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
          {isCreating
            ? t("cheeseTypes.cheeseTypeCreated")
            : t("cheeseTypes.cheeseTypeUpdated")}
        </Alert>
      ),
      { position: "bottom-right" }
    );
    if (isCreating) void router.push(`/cheese-types/${result.cheeseType.name}`);
    else {
      setIsEditing(false);
      methods.reset(convertCheeseTypeToPage(result.cheeseType));
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="mb-2 flex w-full items-center justify-between">
        <Button
          type="button"
          variant="default"
          onClick={() => void router.push("/cheese-types")}
        >
          <ArrowLeft />
        </Button>
        <div className="mr-auto">
          <Typography variant="h2" weight="semibold">
            {methods.getValues().name}
          </Typography>
        </div>
        {!isEditing ? (
          <Button
            type="button"
            variant="tertiary"
            onClick={() => setIsEditing(true)}
          >
            {t("edit")}
          </Button>
        ) : (
          <>
            {!isCreating && (
              <Button
                type="button"
                variant="cancel"
                onClick={() => {
                  setIsEditing(false);
                  methods.reset();
                }}
              >
                {t("revertChanges")}
              </Button>
            )}
            <Button
              type="button"
              variant="tertiary"
              className="ml-2"
              onClick={() => {
                void methods.handleSubmit(saveChanges)();
              }}
            >
              {isCreating ? t("create") : t("save")}
            </Button>
          </>
        )}
      </div>
      <FormProvider {...methods}>
        <form>
          <div className="flex w-full justify-between gap-4">
            <CheeseTypeInfoCard isCreating={isCreating} isEditing={isEditing} />
            <CheeseTypeParametersCard
              isCreating={isCreating}
              isEditing={isEditing}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default CheeseType;
