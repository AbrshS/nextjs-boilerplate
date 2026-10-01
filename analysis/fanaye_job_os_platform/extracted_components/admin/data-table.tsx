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
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

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
import { PaginationControls } from "@/shared/components/pagination-controls";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  toolbarNode?: React.ReactNode;
  page?: number;
  limit?: number;
  totalCount?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  manualPagination?: boolean;
  initialColumnVisibility?: VisibilityState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  toolbarNode,
  page,
  limit,
  totalCount,
  totalPages,
  onPageChange,
  onLimitChange,
  manualPagination,
  initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations("Table");
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(
    initialColumnVisibility ?? {}
  );
  const [rowSelection, setRowSelection] = React.useState({});

  const isServerPaged = Boolean(manualPagination || (onPageChange && onLimitChange));

  const table = useReactTable({
    data,
    columns,
    manualPagination: isServerPaged,
    pageCount: isServerPaged ? (totalPages ?? -1) : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(!isServerPaged ? { getPaginationRowModel: getPaginationRowModel() } : {}),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const filteredTotalCount = table.getFilteredRowModel().rows.length;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-3 gap-3">
        <div className="flex-1 flex items-center gap-2">
          {toolbarNode}
          {!toolbarNode && searchKey && (
            <Input
              placeholder={t("search")}
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" className="ms-auto shrink-0" />}>
            {t("columns")} <ChevronDown className="ms-2 h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
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
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCount > 0 && (
        <div className="px-2 pt-2 text-xs text-muted-foreground">
          {t("rowsSelected", {
            selected: selectedCount,
            total: filteredTotalCount,
          })}
        </div>
      )}

      {isServerPaged && page && limit && onPageChange && onLimitChange ? (
        <PaginationControls
          page={page}
          limit={limit}
          totalCount={totalCount ?? data.length}
          totalPages={totalPages ?? 1}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      ) : (
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {t("rowsSelected", {
              selected: selectedCount,
              total: filteredTotalCount,
            })}
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
