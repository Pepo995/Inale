import React from "react";

type TableShimmerProps = {
  width: number;
  rowsToMap: number;
  tableKey: string;
  rowSize: number;
};

const TableShimmer = ({
  width,
  rowsToMap,
  tableKey,
  rowSize,
}: TableShimmerProps) => (
  <div
    className="flex h-min flex-col gap-y-2"
    style={{
      minWidth: width,
    }}
  >
    <div
      className="h-10 w-full animate-pulse bg-gray-200"
      style={{
        height: rowSize - 8,
      }}
    />
    {Array.from({ length: rowsToMap }, (_, index) => index + 1).map(
      (_row, id) => (
        <div
          className="h-10 w-full animate-pulse bg-gray-200"
          key={`${tableKey}-shimmer-${id}`}
          style={{
            height: rowSize - 8,
          }}
        />
      )
    )}
  </div>
);

export default TableShimmer;
