import { type ReactElement, useState, useMemo, useEffect } from "react";
import type { BatchStats, FormatedDateBatchWithDairy } from "@types";
import { toast } from "react-hot-toast";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import type { NextPageWithLayout } from "../_app";
import type { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { createServerSideHelpers } from "@trpc/react-query/server";
import superjson from "superjson";
import { stringify } from "querystring";
import { prisma } from "@db";
import { appRouter } from "@api/root";

import * as z from "zod";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Layout from "@templates/desktop/Layout";
import Table from "@organisms/Table";
import Searchbar from "@molecules/Searchbar";
import Typography from "@atoms/Typography";
import { Button } from "@atoms/Button";
import { Alert } from "@atoms/Alert";
import { FormTextInput } from "@atoms/TextInput";
import { Card, CardContent, CardHeader } from "@atoms/Card";

import {
  api,
  formatDate,
  serializableBatchWithDairy,
  parseDate,
  parseDateTime,
} from "@utils";
import { useTranslate, useDebounce } from "@hooks";
import { DateValidation } from "@schemas";
import { createColumnHelper } from "@tanstack/react-table";
import { useRouter } from "next/router";

type BatchesPageProps = InferGetServerSidePropsType<
  typeof getServerSideProps
> & {
  initialBatches: FormatedDateBatchWithDairy[];
  pageIndex: number;
  pageSize: number;
  total: number;
  stats?: BatchStats;
  initialMinDate: string;
  initialMaxDate: string;
};

const Header = () => {
  const { t } = useTranslate();

  return (
    <Typography variant="h2" weight="semibold">
      {t("batches.title")}
    </Typography>
  );
};

const TableHeaderItem = ({ value }: { value: string }) => (
  <Typography ellipsis>{value}</Typography>
);

const TableRowItem = ({ value }: { value: string }) => (
  <Typography>{value}</Typography>
);

const Batches: NextPageWithLayout<BatchesPageProps> = ({
  initialBatches,
  pageIndex: initialPageIndex,
  pageSize,
  total: initialTotal,
  stats,
  initialMinDate,
  initialMaxDate,
}) => {
  const [batches, setBatches] = useState(initialBatches);
  const [pageIndex, setPageIndex] = useState(initialPageIndex);
  const [total, setTotal] = useState(initialTotal);
  const [queryEnabled, setQueryEnabled] = useState(false);
  const [searchText, setSearchText] = useState("");

  const debouncedSearchText = useDebounce(searchText, 500);

  useEffect(() => {
    setPageIndex(initialPageIndex);
    setQueryEnabled(true);
  }, [debouncedSearchText, initialPageIndex]);
  const { t } = useTranslate();

  const router = useRouter();
  const { query } = router;

  const updateQuery = (minDate: string, maxDate: string) => {
    const newQuery = `?${stringify({
      ...query,
      minDate,
      maxDate,
    })}`;
    void router.push(newQuery, undefined, {
      shallow: true,
    });
  };

  const dateRangeSchema = z
    .object({
      minDate: DateValidation,
      maxDate: DateValidation,
    })
    .refine(
      ({ minDate, maxDate }) =>
        (parseDate(minDate) as Date) <= (parseDate(maxDate) as Date),
      {
        message: t("batches.form.error"),
        path: ["minDate"],
      }
    );

  type dateRangeForm = z.infer<typeof dateRangeSchema>;

  const methods = useForm<dateRangeForm>({
    mode: "onChange",
    resolver: zodResolver(dateRangeSchema),
    defaultValues: {
      maxDate: initialMaxDate,
      minDate: initialMinDate,
    },
  });

  const [minDate, maxDate] = methods.watch(["minDate", "maxDate"]);

  api.batches.getBatchesByDateRange.useQuery(
    {
      minDate: parseDate(minDate) as Date,
      maxDate: parseDateTime(`${maxDate} 23:59`),
      pagination: {
        page: pageIndex,
        pageSize,
      },
      filter: debouncedSearchText,
    },
    {
      onSuccess: (data) => {
        if (data.success && data.batchesInfo) {
          const { batches, total } = data.batchesInfo;
          setBatches(batches.map(serializableBatchWithDairy));
          setTotal(total);
          updateQuery(minDate, maxDate);
          setQueryEnabled(false);
        } else {
          toast.custom((toastElement) => (
            <Alert
              alertVariant="error"
              onClose={() => toast.remove(toastElement.id)}
            >
              {t(data?.translationKey ?? "errors.default")}
            </Alert>
          ));
        }
      },
      enabled: queryEnabled,
    }
  );

  const onSubmit = () => {
    setQueryEnabled(true);
  };

  const columnHelper = createColumnHelper<FormatedDateBatchWithDairy>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("batchName", {
        cell: (data) => <TableRowItem value={data.getValue() ?? ""} />,
        header: () => <TableHeaderItem value={t("batches.list.batch")} />,
      }),
      columnHelper.accessor("curdInitDateTime", {
        cell: (data) => <TableRowItem value={data.getValue() ?? ""} />,
        header: () => <TableHeaderItem value={t("batches.list.batchDate")} />,
      }),
      columnHelper.accessor("dairy.name", {
        cell: (data) => <TableRowItem value={data.getValue()} />,
        header: () => <TableHeaderItem value={t("dairy")} />,
      }),
      columnHelper.accessor("cheeseTypeName", {
        cell: (data) => <TableRowItem value={data.getValue()} />,
        header: () => <TableHeaderItem value={t("cheeseType")} />,
      }),
    ],
    [columnHelper, t]
  );

  return (
    <div className="flex flex-col gap-y-6">
      <div className="grid grid-cols-3 gap-x-6">
        <Card className="flex items-center justify-between p-8">
          <Typography variant="h3" weight="medium" whitespace="preLine">
            {t("batches.inProcess")}
          </Typography>
          <Typography variant="h1" weight="bold">
            {stats ? stats.batchesInProcess : 0}
          </Typography>
        </Card>
        <Card className="flex items-center justify-between p-8">
          <Typography variant="h3" weight="medium" whitespace="preLine">
            {t("batches.certified")}
          </Typography>
          <Typography variant="h1" weight="bold">
            {stats ? stats.batchesCertified : 0}
          </Typography>
        </Card>
        <Card className="flex items-center justify-between p-8">
          <Typography variant="h3" weight="medium" whitespace="preLine">
            {t("batches.rejected")}
          </Typography>
          <Typography variant="h1" weight="bold">
            {stats ? stats.batchesFailed : 0}
          </Typography>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-y-2 md:w-1/2">
            <Searchbar onTextChange={setSearchText} />
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-3 items-start gap-x-1">
                  <FormTextInput
                    name="minDate"
                    type="string"
                    disabled={queryEnabled}
                    variant={queryEnabled ? "disabled" : "form"}
                    margin="none"
                  />
                  <FormTextInput
                    name="maxDate"
                    type="string"
                    disabled={queryEnabled}
                    variant={queryEnabled ? "disabled" : "form"}
                    margin="none"
                  />
                  <Button
                    variant="outline"
                    buttonColor="tertiary"
                    type="submit"
                  >
                    {t("batches.form.submit")}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </div>
        </CardHeader>
        <CardContent>
          {batches.length > 0 ? (
            <Table
              tableKey="batchesList"
              columns={columns}
              data={batches}
              rowVariant="striped"
              manualPagination={{
                pageIndex,
                setPageIndex,
                onIndexChange: () => setQueryEnabled(true),
                numberOfRecords: total,
              }}
              pageSize={pageSize}
              onView={(id) => void router.push(`/batches/${id}`)}
            />
          ) : (
            <Typography weight="semibold">
              {t("emptyStates.noBatches")}
            </Typography>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

Batches.getLayout = function getLayout(page: ReactElement) {
  return <Layout header={<Header />}>{page}</Layout>;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { batchesListPage, minDate, maxDate } = context.query;
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, req: undefined },
    transformer: superjson,
  });

  const today = new Date();

  // Subtract one week (7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const initialMinDate = minDate
    ? (parseDate(minDate as string) as Date)
    : oneWeekAgo;
  const initialMaxDate = maxDate
    ? parseDateTime(`${maxDate as string} 23:59`)
    : today;

  const pageIndex =
    batchesListPage && typeof batchesListPage === "string"
      ? parseInt(batchesListPage) - 1
      : 0;
  const pageSize = 10;

  const { success, batchesInfo } =
    await helpers.batches.getBatchesByDateRange.fetch({
      minDate: initialMinDate,
      maxDate: initialMaxDate,
      pagination: {
        page: pageIndex,
        pageSize,
      },
    });

  const { initialBatches, total } =
    success && batchesInfo
      ? { initialBatches: batchesInfo.batches, total: batchesInfo.total }
      : { initialBatches: [], total: 0 };

  const { stats } = await helpers.batches.getBatchesStats.fetch();

  return {
    props: {
      trpcState: helpers.dehydrate(),
      initialBatches: initialBatches.map(serializableBatchWithDairy),
      total,
      pageIndex,
      pageSize,
      stats,
      initialMinDate: formatDate(initialMinDate),
      initialMaxDate: formatDate(initialMaxDate),
      ...(await serverSideTranslations(context.locale || "es", ["common"])),
    },
  };
};

export default Batches;
