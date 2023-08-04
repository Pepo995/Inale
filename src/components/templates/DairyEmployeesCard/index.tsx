import React, { type Dispatch, type SetStateAction, useMemo } from "react";
import { Card, CardContent, CardTitle } from "@atoms/Card";
import type { DairyWithProducerAndEmployees } from "@types";
import { useTranslate } from "@hooks";
import Table from "@organisms/Table";
import type { Employee } from "@types";
import { createColumnHelper } from "@tanstack/react-table";
import Typography from "@atoms/Typography";
import { Modal } from "@molecules/Modal";
import { FormProvider, useForm } from "react-hook-form";
import { type z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormTextInput } from "@atoms/TextInput";
import { Button } from "@atoms/Button";
import { employeeFormSchema } from "@schemas";
import { toast } from "react-hot-toast";
import { Alert } from "@atoms/Alert";

const TableHeaderItem = ({ header }: { header: string }) => (
  <Typography ellipsis>{header}</Typography>
);

const TableRowItem = ({ value }: { value: string }) => (
  <Typography>{value}</Typography>
);

type EmployeeFormInfo = z.infer<typeof employeeFormSchema>;

type EmployeeShownProps = {
  document: string;
  id: string;
  name: string;
  dairyRut: string;
};

type DairyEmployeesCardProps = {
  dairy: DairyWithProducerAndEmployees;
  isEditing: boolean;
  employeesShown: EmployeeShownProps[];
  setEmployeesShown: Dispatch<SetStateAction<EmployeeShownProps[]>>;
};

const DairyEmployeesCard = ({
  dairy,
  isEditing,
  employeesShown,
  setEmployeesShown,
}: DairyEmployeesCardProps) => {
  const { t } = useTranslate();

  const methods = useForm<z.infer<typeof employeeFormSchema>>({
    resolver: zodResolver(employeeFormSchema),
    mode: "onSubmit",
  });

  const onSubmit = (values: EmployeeFormInfo) => {
    const { document, name } = values;
    if (employeesShown.some((employee) => employee.document === document)) {
      toast.custom(
        (tElement) => (
          <Alert alertVariant="error" onClose={() => toast.remove(tElement.id)}>
            {t("errors.employeeWithDocumentAlreadyExist")}
          </Alert>
        ),
        { position: "bottom-right" }
      );
      return true;
    }

    const newEmployee: {
      document: string;
      id: string;
      name: string;
      dairyRut: string;
    } = {
      document,
      id: document,
      name,
      dairyRut: dairy.rut.toString(),
    };
    setEmployeesShown((prevEmployeesList) => [
      ...prevEmployeesList,
      newEmployee,
    ]);
    methods.reset();

    return false;
  };

  const columnHelper = createColumnHelper<
    Omit<Employee, "document" | "dairyRut"> & {
      dairyRut: string;
      document: string;
      id: string;
    }
  >();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: () => <TableHeaderItem header="#" />,
        cell: (props) => (
          <TableRowItem value={(props.row.index + 1).toString()} />
        ),
      }),
      columnHelper.accessor("name", {
        cell: (data) => <TableRowItem value={data.getValue() ?? ""} />,
        header: () => <TableHeaderItem header={t("name")} />,
      }),
      columnHelper.accessor("document", {
        cell: (data) => <TableRowItem value={data.getValue()?.toString()} />,
        header: () => (
          <TableHeaderItem header={t("dairies.employees.document")} />
        ),
      }),
    ],
    [columnHelper, t]
  );

  return (
    <Card className="flex w-full flex-col p-6">
      <CardTitle className="w-2/3 font-Inter">
        {t("dairies.employees.name")}
      </CardTitle>
      <CardContent>
        <Table
          columns={columns}
          data={employeesShown}
          tableKey="employees"
          pageSize={5}
          enablePagination
          onDelete={
            !isEditing
              ? undefined
              : (id) =>
                  setEmployeesShown((employeesShown) =>
                    employeesShown.filter((employee) => employee.id !== id)
                  )
          }
          deleteConfirmationInfo={{
            cancelButtonText: t("cancel"),
            confirmButtonText: t("confirm"),
            title: t("dairies.employees.deleteEmployeeTitle"),
            child: (
              <Typography>
                {t("dairies.employees.deleteEmployeeText")}
              </Typography>
            ),
          }}
        />
        {isEditing && (
          <Modal
            triggerButton={<Button variant="tertiary">{t("add")}</Button>}
            title={t("dairies.employees.addEmployee")}
            cancelButtonText={t("cancel")}
            confirmButtonText={t("confirm")}
            onConfirm={async () => {
              let failed = false;
              await methods.handleSubmit(
                () => {
                  failed = onSubmit(methods.getValues());
                },
                () => (failed = true)
              )();
              return failed;
            }}
          >
            <FormProvider {...methods}>
              <form className="flex flex-col gap-6">
                <FormTextInput
                  type="text"
                  name="document"
                  label={t("dairies.employees.document")}
                />
                <FormTextInput type="text" name="name" label={t("name")} />
              </form>
            </FormProvider>
          </Modal>
        )}
      </CardContent>
    </Card>
  );
};

export default DairyEmployeesCard;
