import React, { type ReactNode } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type FilterFn,
  getFilteredRowModel,
} from "@tanstack/react-table";
import TableShimmer from "./TableShimmer";
import Pagination from "@atoms/Pagination";
import { useRouter } from "next/router";
import { type VariantProps, cva } from "class-variance-authority";
import { cn } from "@utils";
import { Trash, Edit2, Eye, ArchiveRestore } from "lucide-react";
import { rankItem } from "@tanstack/match-sorter-utils";
import Searchbar from "@molecules/Searchbar";
import { Modal } from "@molecules/Modal";
import { Button } from "@atoms/Button";

const rowVariants = cva("border-t-[0.5px] border-black ", {
  variants: {
    variant: {
      basic: "bg-white",
      striped: "bg-primary",
    },
    even: {
      true: "",
    },
  },
  compoundVariants: [
    {
      variant: "striped",
      even: true,
      className: "bg-white",
    },
  ],
  defaultVariants: {
    variant: "basic",
  },
});

const tableDataVariants = cva("", {
  variants: {
    size: {
      sm: "py-2",
      md: "py-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type DeleteConfirmationInfo = {
  cancelButtonText?: string;
  title: string;
  confirmButtonText?: string;
  child: ReactNode;
};

type ManualPagination = {
  numberOfRecords: number;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  onIndexChange: () => void;
};

type TableProps<
  T extends {
    id: string | number;
    hideView?: boolean;
    hideEdit?: boolean;
    hideDelete?: boolean;
    hideRestore?: boolean;
  }
> = {
  columns: ColumnDef<T, string>[];
  data: T[];
  width?: number;
  enablePagination?: boolean;
  manualPagination?: ManualPagination;
  pageSize?: number;
  numberOfPages?: number;
  pageNumber?: number;
  rowVariant?: VariantProps<typeof rowVariants>["variant"];
  tableSize?: VariantProps<typeof tableDataVariants>["size"];
  onEdit?: (id: string | number) => void;
  onView?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onRestore?: (id: string | number) => void;
  tableKey: string;
  showGlobalFilter?: boolean;
  deleteConfirmationInfo?: DeleteConfirmationInfo;
};

/**
 * This is a Table Component created using headless ui React Table v7 by Tan Stack. Columns and data props must follow the react table v7 format.
 * @param {Column<T>[]} columns - Receives the columns to display in the table. Each column accesor must match a data key. Must be memoized.
 * @param {T[]} data - Receives the data to display in the table. Must be memoized.
 * @param {number} width - Sets the minimum width for the table, defaults to 600px.
 * @param {number} pageSize - Sets the number of rows to display per page, defaults to 10.
 * @param {boolean} enablePagination - Sets whether to display pagination or not, defaults to false.
 * @param {number} numberOfPages - Sets the number of pages to display in the pagination contoller, defaults to 3.
 * @param {VariantProps<typeof rowVariants>["variant"]} rowVariant - Sets the variant for the table rows, defaults to "basic".
 * @param {VariantProps<typeof tableDataVariants>["size"]} tableSize - Sets the size for the table, it changes padding in rows, defaults to "md".
 * @param {function} onEdit - When set: Displays the edit button and calls this function when pressed, defaults to undefined.
 * @param {function} onView - When set: Displays the view button and calls this function when pressed, defaults to undefined.
 * @param {function} onDelete - When set: Displays the delete button and calls this function when pressed, defaults to undefined.
 * @param {string} tableKey - Sets the key to use in the query string for the pagination, must be unique for tables in same page.
 * @returns A table component.
 */
const Table = <
  T extends {
    id: string | number;
    hideView?: boolean;
    hideEdit?: boolean;
    hideDelete?: boolean;
    hideRestore?: boolean;
  }
>({
  columns,
  data,
  width = 600,
  enablePagination = false,
  manualPagination,
  pageSize = 10,
  numberOfPages = 3,
  rowVariant,
  tableSize,
  onEdit,
  onView,
  onDelete,
  onRestore,
  tableKey,
  showGlobalFilter = false,
  deleteConfirmationInfo,
}: TableProps<T>) => {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = React.useState("");
  const pageIndex = tableKey
    ? parseInt((router.query[`${tableKey}Page`] as string) ?? 1)
    : 1;

  const fuzzyFilter: FilterFn<T> = (row, columnId, value: string, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({
      itemRank,
    });

    // Return if the item should be filtered in/out
    return itemRank.passed;
  };

  const tableInstance = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    manualPagination: !!manualPagination,
    initialState: {
      pagination: enablePagination
        ? {
            pageIndex: pageIndex - 1,
            pageSize: pageSize,
          }
        : undefined,
    },
    state: {
      globalFilter: showGlobalFilter ? globalFilter : undefined,
    },
    onGlobalFilterChange: showGlobalFilter ? setGlobalFilter : undefined,
    globalFilterFn: showGlobalFilter ? fuzzyFilter : undefined,
    getFilteredRowModel: showGlobalFilter ? getFilteredRowModel() : undefined,
  });

  const {
    getHeaderGroups,
    getRowModel,
    getCanNextPage,
    getCanPreviousPage,
    getPageCount,
    getState,
    setPageIndex,
  } = tableInstance;

  const { pagination } = getState();

  const rowsToMap = getRowModel().rows;
  const rowSize = tableSize === "sm" ? 36.5 : 52.5;
  const rowCount =
    enablePagination || manualPagination
      ? pageSize + 1
      : rowsToMap
      ? rowsToMap.length + 1
      : 0;
  const minHeight = rowCount * rowSize;
  return (
    <div className="flex flex-col gap-y-2">
      <div
        className="w-full overflow-x-scroll bg-white "
        style={{
          minHeight: `${minHeight}px`,
        }}
      >
        {showGlobalFilter && (
          <div className="w-full sm:w-1/2 md:w-2/5">
            <Searchbar onTextChange={(newText) => setGlobalFilter(newText)} />
          </div>
        )}
        {router.isReady ? (
          <table
            className="w-full"
            style={{
              minWidth: `${width}px`,
            }}
            key={tableKey}
          >
            <thead>
              {getHeaderGroups().map((headerGroup) => (
                <tr
                  className="text-left"
                  key={`${tableKey}-header-${headerGroup.id}`}
                >
                  {headerGroup.headers.map((header) => (
                    <th
                      className={cn(tableDataVariants({ size: tableSize }))}
                      key={`${tableKey}-header-${header.id}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rowsToMap.map((row, id) => (
                <tr
                  className={cn(
                    rowVariants({ variant: rowVariant, even: id % 2 === 0 })
                  )}
                  key={`${tableKey}-row-${row.id}`}
                >
                  {row.getVisibleCells().map((cell, id) => (
                    <td
                      className={cn(tableDataVariants({ size: tableSize }))}
                      key={`${tableKey}-cell-${id}`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  <td key={`${tableKey}-Actions`} className="flex py-1">
                    {onDelete &&
                      !row.original.hideDelete &&
                      (deleteConfirmationInfo ? (
                        <Modal
                          cancelButtonText={
                            deleteConfirmationInfo.cancelButtonText
                          }
                          confirmButtonText={
                            deleteConfirmationInfo.confirmButtonText
                          }
                          title={deleteConfirmationInfo.title}
                          onConfirm={() => onDelete(row.original.id)}
                          triggerButton={
                            <Button variant="ghost">
                              <Trash className="text-slate-500" width={18} />
                            </Button>
                          }
                        >
                          {deleteConfirmationInfo.child}
                        </Modal>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => onDelete(row.original.id)}
                        >
                          <Trash className="text-slate-500" width={18} />
                        </Button>
                      ))}
                    {onRestore && !row.original.hideRestore && (
                      <Button
                        variant="ghost"
                        onClick={() => onRestore(row.original.id)}
                      >
                        <ArchiveRestore className="text-slate-500" width={18} />
                      </Button>
                    )}
                    {onEdit && !row.original.hideEdit && (
                      <Button
                        variant="ghost"
                        onClick={() => onEdit(row.original.id)}
                      >
                        <Edit2 className="text-slate-500" width={18} />
                      </Button>
                    )}
                    {onView && !row.original.hideView && (
                      <Button
                        variant="ghost"
                        onClick={() => onView(row.original.id)}
                      >
                        <Eye className="text-slate-500" width={18} />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <TableShimmer
            rowSize={rowSize}
            rowsToMap={rowCount}
            tableKey={tableKey}
            width={width}
          />
        )}
      </div>
      {router.isReady && enablePagination && tableKey && getPageCount() > 1 && (
        <div className="self-end">
          <Pagination
            canNextPage={getCanNextPage()}
            canPreviousPage={getCanPreviousPage()}
            gotoPage={setPageIndex}
            numberOfPages={numberOfPages}
            pageCount={getPageCount()}
            pageIndex={pagination.pageIndex}
            tableKey={tableKey}
          />
        </div>
      )}
      {manualPagination &&
        tableKey &&
        manualPagination.numberOfRecords > pageSize && (
          <div className="self-end">
            <Pagination
              tableKey={tableKey}
              canNextPage={
                (manualPagination.pageIndex + 1) * pageSize <
                manualPagination.numberOfRecords
              }
              canPreviousPage={manualPagination.pageIndex > 0}
              gotoPage={(page: number) => {
                manualPagination.setPageIndex(page);
                manualPagination.onIndexChange();
              }}
              pageCount={Math.ceil(manualPagination.numberOfRecords / pageSize)}
              numberOfPages={numberOfPages}
              pageIndex={manualPagination.pageIndex}
            />
          </div>
        )}
    </div>
  );
};

export default Table;
