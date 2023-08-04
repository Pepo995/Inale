import React, { useMemo, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslate } from "@hooks";
import Typography from "@atoms/Typography";
import Table from "@organisms/Table";

import type { DairyWithProducerAndEmployees } from "@types";
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
  <Typography>{value}</Typography>
);

type DairiesProps = {
  dairies: DairyWithProducerAndEmployees[];
} & React.InputHTMLAttributes<HTMLInputElement>;

const Dairies = ({ dairies, ...props }: DairiesProps) => {
  const { t } = useTranslate();
  const router = useRouter();

  const [showingDeleted, setShowingDeleted] = useState(false);
  // Mapping to avoid `number | null` types.
  const [dairiesShown, setDairiesShown] = useState(
    dairies.map((dairy) => ({
      name: dairy.name,
      companyNumber: dairy.companyNumber ?? "",
      rut: dairy.rut?.toString() ?? "",
      producer: dairy.producer,
      address: dairy.address ?? "",
      id: dairy.rut,
      active: !dairy.deleted,
      hideDelete: !!dairy.deleted,
      hideView: !!dairy.deleted,
      hideRestore: !dairy.deleted,
    })) ?? []
  );

  const deleteDairyMutation = api.dairies.deleteDairy.useMutation();
  const restoreDairyMutation = api.dairies.restoreDairy.useMutation();

  const deleteDairy = async (rut: number) => {
    const result = await deleteDairyMutation.mutateAsync(rut);

    if (!result.success || !result.deletedDairy) {
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
          {t("dairies.dairyDeleted")}
        </Alert>
      ),
      { position: "bottom-right" }
    );
    setDairiesShown(
      dairiesShown.map((dairy) =>
        parseInt(dairy.rut) !== rut
          ? dairy
          : {
              ...dairy,
              active: false,
              hideRestore: false,
              hideDelete: true,
              hideView: true,
            }
      )
    );
  };

  const restoreDairy = async (rut: number) => {
    const result = await restoreDairyMutation.mutateAsync(rut);

    if (!result.success || !result.restoredDairy) {
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
          {t("dairies.dairyRestored")}
        </Alert>
      ),
      { position: "bottom-right" }
    );
    setDairiesShown(
      dairiesShown.map((dairy) =>
        parseInt(dairy.rut) !== rut
          ? dairy
          : {
              ...dairy,
              active: true,
              hideRestore: true,
              hideDelete: false,
              hideView: false,
            }
      )
    );
  };

  const columnHelper = createColumnHelper<(typeof dairiesShown)[0]>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        cell: (data) => <TableRowItem value={data.getValue()} />,
        header: () => <TableHeaderItem header={t("name")} />,
      }),
      columnHelper.accessor("companyNumber", {
        cell: (data) => <TableRowItem value={data.getValue()?.toString()} />,
        header: () => <TableHeaderItem header={t("dairies.companyNumber")} />,
      }),
      columnHelper.accessor("rut", {
        cell: (data) => <TableRowItem value={data.getValue()?.toString()} />,
        header: () => <TableHeaderItem header={t("dairies.rut")} />,
      }),
      columnHelper.accessor("producer.name", {
        cell: (data) => (
          <TableRowItem value={data.getValue()?.toString() ?? ""} />
        ),
        header: () => <TableHeaderItem header={t("dairies.companyOwner")} />,
      }),
      columnHelper.accessor("address", {
        cell: (data) => <TableRowItem value={data.getValue()?.toString()} />,
        header: () => <TableHeaderItem header={t("dairies.address")} />,
      }),
    ],
    [columnHelper, t]
  );

  return (
    <div className="w-full flex-col" {...props}>
      <div className="mb-4 flex gap-2 sm:gap-6">
        <Card className="h-full pt-8">
          <CardContent className="flex gap-4">
            <Typography variant="h2" weight="normal">
              {t("dairies.activeDairies")}
            </Typography>
            <Typography variant="h2" weight="bold">
              {dairiesShown.filter((dairy) => dairy.active).length}
            </Typography>
          </CardContent>
        </Card>
        <Card className="h-full pt-8">
          <CardContent className="flex gap-4">
            <Typography variant="h2" weight="normal">
              {t("dairies.registeredEmployees")}
            </Typography>
            <Typography variant="h2" weight="bold">
              {dairies.reduce(
                (prev, dairy) => (prev += dairy.employees.length),
                0
              )}
            </Typography>
          </CardContent>
        </Card>
      </div>
      <Card className="flex w-full flex-col pt-6">
        <CardContent>
          <Table
            columns={columns}
            data={
              showingDeleted
                ? dairiesShown
                : dairiesShown.filter((dairyShown) => dairyShown.active)
            }
            tableKey="dairies"
            onView={(rut) => void router.push(`/dairies/${rut}`)}
            onDelete={(rut) => void deleteDairy(rut as number)}
            deleteConfirmationInfo={{
              cancelButtonText: t("cancel"),
              confirmButtonText: t("delete"),
              title: t("dairies.deleteDairy"),
              child: <Typography>{t("dairies.deleteDairyText")}</Typography>,
            }}
            onRestore={(rut) => void restoreDairy(rut as number)}
            rowVariant="striped"
            enablePagination
            showGlobalFilter
          />
        </CardContent>
        <CardFooter>
          <div className="flex gap-2">
            <Typography variant="h3" weight="normal">
              <label htmlFor="show-deleted-dairies-switch">
                {t("dairies.showDeleted")}
              </label>
            </Typography>
            <Switch
              id="show-deleted-dairies-switch"
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

export default Dairies;
