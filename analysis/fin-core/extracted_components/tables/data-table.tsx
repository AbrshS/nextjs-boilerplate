"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDownIcon, ChevronsUpDownIcon } from "lucide-react";

import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { cn } from "@/shared/utils/cn";
import { useTranslations } from "next-intl";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  /** When set, search matches any of these column ids / accessor keys. */
  searchKeys?: string[];
  searchPlaceholder?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  getRowClassName?: (row: TData) => string | undefined;
  emptyMessage?: string;
  /** When false, column header sort controls are hidden. Default true. */
  enableSorting?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchKeys,
  searchPlaceholder,
  pageSize = 12,
  toolbar,
  onRowClick,
  getRowClassName,
  emptyMessage = "No results.",
  enableSorting = true,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations("Table");
  const resolvedSearchPlaceholder = searchPlaceholder ?? t("search");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");

  const multiSearchKeys = searchKeys?.length
    ? searchKeys
    : searchKey
      ? [searchKey]
      : [];

  const table = useReactTable({
    data,
    columns,
    initialState: { pagination: { pageSize } },
    enableSorting,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue ?? "")
        .trim()
        .toLowerCase();
      if (!q || multiSearchKeys.length === 0) return true;
      return multiSearchKeys.some((key) => {
        const raw =
          row.getValue(key) ??
          (row.original as Record<string, unknown>)[key] ??
          "";
        return String(raw).toLowerCase().includes(q);
      });
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  return (
    <div className="min-w-0 w-full space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-3">
          {multiSearchKeys.length > 0 ? (
            <Input
              placeholder={resolvedSearchPlaceholder}
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="h-10 max-w-sm bg-pure-white"
            />
          ) : null}
          {toolbar}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="bg-pure-white" />
            }
          >
            {t("columns")}
            <ChevronDownIcon className="ms-1.5 size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-w-full min-w-0 overflow-x-auto rounded-[var(--radius-cards)] border border-hairline bg-pure-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-hairline hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 bg-surface-ivory/80 px-4 text-[12px] font-semibold tracking-[0.02em] text-slate-gray"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          header.column.getCanSort() &&
                            "flex cursor-pointer items-center gap-1 select-none"
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() ? (
                          <ChevronsUpDownIcon className="size-3.5 opacity-40" />
                        ) : null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "border-hairline",
                    onRowClick && "cursor-pointer",
                    getRowClassName?.(row.original)
                  )}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3 text-[13px]">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-28 text-center text-slate-gray"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[12px] text-slate-gray">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s)
          {table.getFilteredSelectedRowModel().rows.length
            ? " selected"
            : " shown"}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-gray">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="bg-pure-white"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t("previous")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-pure-white"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t("next")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Status / risk chip for tables */
export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        tone === "good" && "bg-[#046645]/10 text-[#046645]",
        tone === "warn" && "bg-[#b45309]/10 text-[#b45309]",
        tone === "bad" && "bg-[#b42318]/10 text-[#b42318]",
        tone === "info" && "bg-electric-cobalt/10 text-electric-cobalt",
        tone === "neutral" && "bg-surface-ivory text-slate-gray"
      )}
    >
      {label}
    </span>
  );
}
