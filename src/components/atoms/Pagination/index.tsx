import React from "react";
import { useRouter } from "next/router";
import { stringify } from "querystring";

import { cn } from "@utils";
import { cva } from "class-variance-authority";
import { useTranslate } from "@hooks";

const paginationVariants = cva(
  "ml-0 box-border border border-gray-300 bg-white px-3 py-2 leading-tight text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white relative z-0 hover:cursor-pointer",
  {
    variants: {
      nextButton: {
        enabled: "rounded-r-sm ",
        disabled: "rounded-r-sm !bg-disabled hover:cursor-default",
      },
      backButton: {
        enabled: "rounded-l-sm ",
        disabled: "rounded-l-sm !bg-disabled hover:cursor-default",
      },
      selected: {
        true: "!bg-tertiary !border-tertiary !text-tertiary-foreground ring-2 ring-tertiary/20 z-10",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

type PaginationProps = {
  pageCount: number;
  pageIndex: number;
  gotoPage: (page: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  numberOfPages: number;
  tableKey: string;
};

const Pagination = ({
  pageCount,
  pageIndex,
  gotoPage,
  canPreviousPage,
  canNextPage,
  numberOfPages,
  tableKey,
}: PaginationProps) => {
  const { t } = useTranslate();
  const router = useRouter();
  const { query } = router;

  const updateQuery = async (page: number) => {
    const newQuery = `?${stringify({
      ...query,
      [`${tableKey}Page`]: page,
    })}`;
    await router.push(newQuery, undefined, {
      shallow: true,
    });
  };

  return (
    <div className="h-min">
      <ul className="inline-flex -space-x-px">
        <li>
          {canPreviousPage ? (
            <div
              onClick={async () => {
                await updateQuery(pageIndex);
                gotoPage(pageIndex - 1);

              }}
              className={cn(paginationVariants({ backButton: "enabled" }))}
            >
              {t("pagination.previous")}
            </div>
          ) : (
            <div className={cn(paginationVariants({ backButton: "disabled" }))}>
              {t("pagination.previous")}
            </div>
          )}
        </li>
        {pageCount > numberOfPages
          ? Array.from({ length: numberOfPages }, (_, index) => {
              if (
                pageIndex >= pageCount - (numberOfPages - 1) &&
                pageIndex <= pageCount
              ) {
                return pageCount - (numberOfPages - 1) + index;
              } else {
                return pageIndex + index + (pageIndex == 0 ? 1 : 0);
              }
            }).map((page, i) => (
              <li key={i}>
                <div
                  onClick={async () => {
                    await updateQuery(page);
                    gotoPage(page - 1);
                  }}
                  className={cn(
                    paginationVariants({ selected: page === pageIndex + 1 })
                  )}
                >
                  {page}
                </div>
              </li>
            ))
          : Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (page, i) => (
                <li key={i}>
                  <div
                    onClick={async () => {
                      await updateQuery(page);
                      gotoPage(page - 1);
                    }}
                    className={cn(
                      paginationVariants({ selected: page === pageIndex + 1 })
                    )}
                  >
                    {page}
                  </div>
                </li>
              )
            )}
        <li>
          {canNextPage ? (
            <div
              onClick={async () => {
                await updateQuery(pageIndex + 2);
                gotoPage(pageIndex + 1);


              }}
              className={cn(paginationVariants({ nextButton: "enabled" }))}
            >
              {t("pagination.next")}
            </div>
          ) : (
            <div className={cn(paginationVariants({ nextButton: "disabled" }))}>
              {t("pagination.next")}
            </div>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
