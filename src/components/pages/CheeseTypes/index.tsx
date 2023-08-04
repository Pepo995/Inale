import React, { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslate } from "@hooks";
import Typography from "@atoms/Typography";
import Table from "@organisms/Table";

import type { CheeseType } from "@types";
import { Card, CardContent, CardFooter } from "@atoms/Card";
import { useRouter } from "next/router";
import { api } from "@utils";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";
import { Switch } from "@atoms/Switch";

const TableHeaderItem = ({ header }: { header: string }) => (
  <Typography ellipsis>{header}</Typography>
);

const TableRowItem = ({ value }: { value: string }) => (
  <Typography marginBottom="none">{value}</Typography>
);

type CheeseTypesProps = {
  cheeseTypes?: CheeseType[];
} & React.InputHTMLAttributes<HTMLInputElement>;

const CheeseTypes = ({ cheeseTypes, ...props }: CheeseTypesProps) => {
  const { t } = useTranslate();
  const router = useRouter();

  const [showingDeleted, setShowingDeleted] = useState(false);
  // Mapping to avoid `number | null` types.
  const [cheesesShown, setCheesesShown] = useState(
    cheeseTypes?.map((cheeseType) => ({
      id: cheeseType.name,
      name: cheeseType.name,
      registrationCode: cheeseType.registrationCode,
      active: !cheeseType.deleted,
      hideDelete: !!cheeseType.deleted,
      hideView: !!cheeseType.deleted,
      hideRestore: !cheeseType.deleted,
    })) ?? []
  );

  const deleteCheeseTypeMutation =
    api.cheeseTypes.deleteCheeseType.useMutation();
  const restoreCheeseMutation = api.cheeseTypes.restoreCheeseType.useMutation();

  const deleteCheeseType = async (name: string) => {
    const result = await deleteCheeseTypeMutation.mutateAsync(name);

    if (!result.success || !result.deletedCheeseType) {
      return toast.custom(
        (to) => (
          <Alert alertVariant="error" onClose={() => toast.remove(to.id)}>
            {t(result.translationKey ?? "errors.default")}
          </Alert>
        ),
        { position: "bottom-right" }
      );
    }

    toast.custom(
      (to) => (
        <Alert alertVariant="success" onClose={() => toast.remove(to.id)}>
          {t("cheeseTypes.cheeseTypeDeleted")}
        </Alert>
      ),
      { position: "bottom-right" }
    );
    setCheesesShown(
      cheesesShown.map((cheese) =>
        cheese.name !== name
          ? cheese
          : {
              ...cheese,
              active: false,
              hideRestore: false,
              hideDelete: true,
              hideView: true,
            }
      )
    );
  };

  const restoreCheese = async (name: string) => {
    const result = await restoreCheeseMutation.mutateAsync(name);

    if (!result.success || !result.restoredCheeseType) {
      return toast.custom(
        (to) => (
          <Alert alertVariant="error" onClose={() => toast.remove(to.id)}>
            {t(result.translationKey ?? "errors.default")}
          </Alert>
        ),
        { position: "bottom-right" }
      );
    }

    toast.custom(
      (to) => (
        <Alert alertVariant="success" onClose={() => toast.remove(to.id)}>
          {t("cheeseTypes.cheeseTypeRestored")}
        </Alert>
      ),
      { position: "bottom-right" }
    );
    setCheesesShown(
      cheesesShown.map((cheese) =>
        cheese.name !== name
          ? cheese
          : {
              ...cheese,
              active: true,
              hideRestore: true,
              hideDelete: false,
              hideView: false,
            }
      )
    );
  };

  const columnHelper = createColumnHelper<(typeof cheesesShown)[0]>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        cell: (data) => <TableRowItem value={data.getValue()} />,
        header: () => <TableHeaderItem header={t("name")} />,
      }),
      columnHelper.accessor("registrationCode", {
        cell: (data) => <TableRowItem value={data.getValue() ?? ""} />,
        header: () => (
          <TableHeaderItem header={t("cheeseTypes.registrationCode")} />
        ),
      }),
    ],
    [columnHelper, t]
  );

  return !cheeseTypes ? (
    <Typography>{t("cheeseTypes.errorLoadingCheeseTypes")}</Typography>
  ) : (
    <div className="w-full flex-col" {...props}>
      <Card className="flex w-full flex-col pt-6">
        <CardContent>
          <Table
            columns={columns}
            data={
              showingDeleted
                ? cheesesShown
                : cheesesShown.filter((cheeseShown) => cheeseShown.active)
            }
            tableKey="cheese-types"
            onView={(name) => void router.push(`/cheese-types/${name}`)}
            onDelete={(name) => void deleteCheeseType(name as string)}
            deleteConfirmationInfo={{
              cancelButtonText: t("cancel"),
              confirmButtonText: t("delete"),
              title: t("cheeseTypes.deleteCheeseType"),
              child: (
                <Typography>{t("cheeseTypes.deleteCheeseTypeText")}</Typography>
              ),
            }}
            onRestore={(name) => void restoreCheese(name as string)}
            rowVariant="striped"
            enablePagination
            showGlobalFilter
          />
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <Typography variant="h3" weight="normal">
              <label htmlFor="show-deleted-cheese-types-switch">
                {t("cheeseTypes.showDeleted")}
              </label>
            </Typography>
            <Switch
              id="show-deleted-cheese-types-switch"
              onCheckedChange={(active) => setShowingDeleted(active)}
              className="my-auto"
              checked={showingDeleted}
            />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheeseTypes;
