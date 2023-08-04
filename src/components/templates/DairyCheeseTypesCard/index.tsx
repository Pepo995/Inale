import React, { type Dispatch, type SetStateAction, useMemo } from "react";
import { Card, CardContent, CardTitle } from "@atoms/Card";

import { useTranslate } from "@hooks";
import Table from "@organisms/Table";
import type {
  DairyCheeseTypeFormInfo,
  DairyWithProducerAndEmployees,
} from "@types";
import { createColumnHelper } from "@tanstack/react-table";
import Typography from "@atoms/Typography";
import { dairyCheeseTypeFormSchema } from "@schemas";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@molecules/Modal";
import { Button } from "@atoms/Button";
import SelectDropdown from "@molecules/Dropdown";
import { api } from "@utils";
import { Switch } from "@atoms/Switch";
import Loading from "@pages/Loading";

const TableHeaderItem = ({ header }: { header: string }) => (
  <Typography ellipsis>{header}</Typography>
);

const TableRowItem = ({ value }: { value: string }) => (
  <Typography>{value}</Typography>
);

export type CheeseTypeShownProps = {
  id: string;
  dairyRut: string;
  cheeseTypeName: string;
  active: boolean;
  hideDelete: boolean;
  hideRestore: boolean;
  hideView: boolean;
  batchesInProduction: string;
};

type DairyCheeseTypesCardProps = {
  dairy: DairyWithProducerAndEmployees;
  isEditing: boolean;
  cheeseTypesShown: CheeseTypeShownProps[];
  setCheeseTypesShown: Dispatch<SetStateAction<CheeseTypeShownProps[]>>;
  showingDeleted: boolean;
  setShowingDeleted: Dispatch<SetStateAction<boolean>>;
};

const DairyCheeseTypesCard = ({
  dairy,
  isEditing,
  cheeseTypesShown,
  setCheeseTypesShown,
  showingDeleted,
  setShowingDeleted,
}: DairyCheeseTypesCardProps) => {
  const { t } = useTranslate();

  const { isLoading, data: result } =
    api.cheeseTypes.getAllCheeseTypes.useQuery();

  const methods = useForm<DairyCheeseTypeFormInfo>({
    resolver: zodResolver(dairyCheeseTypeFormSchema),
    mode: "onSubmit",
  });

  const onSubmit = (values: DairyCheeseTypeFormInfo) => {
    const { cheeseTypeName } = values;
    const newCheeseType = {
      id: cheeseTypeName,
      cheeseTypeName,
      dairyRut: dairy.rut.toString(),
      active: true,
      hideRestore: true,
      hideDelete: false,
      hideView: false,
      batchesInProduction: "0",
    };
    setCheeseTypesShown((prevCheeseTypesList) => [
      ...prevCheeseTypesList,
      newCheeseType,
    ]);
    cheeseTypesMap.set(cheeseTypeName, newCheeseType);
    methods.resetField("cheeseTypeName");
  };

  const restoreCheeseType = (cheeseTypeName: string) => {
    setCheeseTypesShown(
      cheeseTypesShown.map((cheeseType) =>
        cheeseType.cheeseTypeName !== cheeseTypeName
          ? cheeseType
          : {
              ...cheeseType,
              active: true,
              hideRestore: true,
              hideDelete: false,
              hideView: false,
            }
      )
    );
  };

  const columnHelper = createColumnHelper<{
    id: string;
    cheeseTypeName: string;
    batchesInProduction: string;
  }>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => <TableHeaderItem header="#" />,
        cell: (props) => (
          <TableRowItem value={(props.row.index + 1).toString()} />
        ),
      }),
      columnHelper.accessor("cheeseTypeName", {
        cell: (data) => <TableRowItem value={data.getValue()} />,
        header: () => <TableHeaderItem header={t("name")} />,
      }),
      columnHelper.accessor("batchesInProduction", {
        cell: (data) => <TableRowItem value={data.getValue()} />,
        header: () => (
          <TableHeaderItem
            header={t("dairies.cheeseTypes.batchesInProduction")}
          />
        ),
      }),
    ],
    [columnHelper, t]
  );

  if (isLoading) return <Loading />;

  if (!result || !result.success || !result.allCheeseTypes)
    return (
      <Typography>
        {t(
          result?.translationKey ??
            "dairies.cheeseTypes.errorLoadingDairyCheeseTypes"
        )}
      </Typography>
    );

  const cheeseTypesMap = new Map<string, CheeseTypeShownProps>();

  cheeseTypesShown.forEach((cheeseType) =>
    cheeseTypesMap.set(cheeseType.cheeseTypeName, cheeseType)
  );

  const cheeseTypesToChoose = result.allCheeseTypes.filter(
    (cheeseType) => !cheeseTypesMap.get(cheeseType.name)
  );

  return (
    <Card className="flex w-full flex-col p-6">
      <CardTitle className="w-2/3 font-Inter">
        {t("dairies.cheeseTypes.name")}
      </CardTitle>
      <CardContent>
        <Table
          columns={columns}
          data={
            showingDeleted
              ? cheeseTypesShown
              : cheeseTypesShown.filter(
                  (cheeseTypeShown) => cheeseTypeShown.active
                )
          }
          tableKey="cheese-types"
          pageSize={5}
          enablePagination
          onDelete={
            !isEditing
              ? undefined
              : (cheeseTypeName) =>
                  setCheeseTypesShown(
                    cheeseTypesShown.map((cheeseType) =>
                      cheeseType.cheeseTypeName !== cheeseTypeName
                        ? cheeseType
                        : {
                            ...cheeseType,
                            active: false,
                            hideRestore: false,
                            hideDelete: true,
                            hideView: true,
                          }
                    )
                  )
          }
          deleteConfirmationInfo={{
            cancelButtonText: t("cancel"),
            confirmButtonText: t("confirm"),
            title: t("dairies.cheeseTypes.deleteDairyCheeseTypeTitle"),
            child: (
              <Typography>
                {t("dairies.cheeseTypes.deleteDairyCheeseTypeText")}
              </Typography>
            ),
          }}
          onRestore={(cheeseTypeName) =>
            void restoreCheeseType(cheeseTypeName as string)
          }
        />

        {isEditing && (
          <div className="mt-1 flex items-center gap-14">
            <div className="flex gap-2">
              <Typography>{t("dairies.cheeseTypes.showDeleted")}</Typography>
              <Switch
                id="show-deleted-cheese-types-switch"
                onCheckedChange={(active) => setShowingDeleted(active)}
                className="my-auto"
                checked={showingDeleted}
              />
            </div>
            <Modal
              triggerButton={<Button variant="tertiary">{t("add")}</Button>}
              title={t("dairies.cheeseTypes.addCheeseType")}
              cancelButtonText={t("cancel")}
              confirmButtonText={t("confirm")}
              onConfirm={async () => {
                let failed = false;
                await methods.handleSubmit(onSubmit, () => (failed = true))();
                return failed;
              }}
            >
              <FormProvider {...methods}>
                <form className="flex items-center justify-between gap-6">
                  {cheeseTypesToChoose.length > 0 ? (
                    <>
                      <Typography variant="h6" weight="medium">
                        {t("dairies.cheeseTypes.name")}
                      </Typography>
                      <SelectDropdown
                        placeholder={t("inputs.selectOption")}
                        name="cheeseTypeName"
                        options={cheeseTypesToChoose.map((item) => ({
                          id: item.name,
                          label: item.name,
                        }))}
                      />
                    </>
                  ) : (
                    <Typography>
                      {t("emptyStates.noCheeseTypesToChoose")}
                    </Typography>
                  )}
                </form>
              </FormProvider>
            </Modal>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DairyCheeseTypesCard;
