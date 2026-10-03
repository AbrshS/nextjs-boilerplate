"use client";

import * as React from "react";
import {
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpDownIcon,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/shared/ui/table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { StatusBadge, type TransactionStatus } from "@/shared/ui/status-badge";
import { cn } from "@/shared/utils/cn";

export type TransactionItem = {
  id: string;
  referenceNumber: string;
  description: string;
  counterparty: string;
  category: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  currency: string;
  status: TransactionStatus;
  postedAt: string;
};

const SAMPLE_TRANSACTIONS: TransactionItem[] = [
  {
    id: "tx-1",
    referenceNumber: "TX-2026-001",
    description: "Enterprise Cloud Subscription Tier 3",
    counterparty: "Google Cloud EMEA",
    category: "Cloud Infrastructure",
    type: "DEBIT",
    amount: 4250.0,
    currency: "USD",
    status: "PAID",
    postedAt: "2026-10-02",
  },
  {
    id: "tx-2",
    referenceNumber: "TX-2026-002",
    description: "Q3 Fintech Consulting Retainer",
    counterparty: "Ethio Telecom",
    category: "Professional Services",
    type: "CREDIT",
    amount: 28500.0,
    currency: "USD",
    status: "PAID",
    postedAt: "2026-10-01",
  },
  {
    id: "tx-3",
    referenceNumber: "TX-2026-003",
    description: "Hardware Security Modules Lease",
    counterparty: "Yubico Hardware",
    category: "Security",
    type: "DEBIT",
    amount: 1850.0,
    currency: "USD",
    status: "PENDING",
    postedAt: "2026-09-30",
  },
  {
    id: "tx-4",
    referenceNumber: "TX-2026-004",
    description: "Dedicated Fibre Uplink Redundancy",
    counterparty: "Safaricom Ethiopia",
    category: "Telecom",
    type: "DEBIT",
    amount: 3200.0,
    currency: "USD",
    status: "OVERDUE",
    postedAt: "2026-09-28",
  },
  {
    id: "tx-5",
    referenceNumber: "TX-2026-005",
    description: "Cross-Border Settlement Wire",
    counterparty: "Standard Chartered Bank",
    category: "Treasury",
    type: "CREDIT",
    amount: 64200.0,
    currency: "USD",
    status: "PAID",
    postedAt: "2026-09-25",
  },
  {
    id: "tx-6",
    referenceNumber: "TX-2026-006",
    description: "Unauthorized Terminal Sweep (Blocked)",
    counterparty: "Unknown Relay",
    category: "Audit Exception",
    type: "DEBIT",
    amount: 120.0,
    currency: "USD",
    status: "DECLINED",
    postedAt: "2026-09-24",
  },
  {
    id: "tx-7",
    referenceNumber: "TX-2026-007",
    description: "Annual SOC2 Compliance Audit",
    counterparty: "PricewaterhouseCoopers",
    category: "Governance",
    type: "DEBIT",
    amount: 18000.0,
    currency: "USD",
    status: "PENDING",
    postedAt: "2026-09-22",
  },
  {
    id: "tx-8",
    referenceNumber: "TX-2026-008",
    description: "Core Banking API License Royalties",
    counterparty: "Commercial Bank of Ethiopia",
    category: "Software Licensing",
    type: "CREDIT",
    amount: 35000.0,
    currency: "USD",
    status: "PAID",
    postedAt: "2026-09-20",
  },
];

export function TransactionsTable() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

  const filtered = React.useMemo(() => {
    return SAMPLE_TRANSACTIONS.filter((tx) => {
      const matchesStatus =
        statusFilter === "ALL" || tx.status === statusFilter;
      const lower = query.toLowerCase();
      const matchesSearch =
        tx.referenceNumber.toLowerCase().includes(lower) ||
        tx.description.toLowerCase().includes(lower) ||
        tx.counterparty.toLowerCase().includes(lower);
      return matchesStatus && matchesSearch;
    });
  }, [query, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const pageTransactions = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Card className="border-border/70 bg-card shadow-none">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/60 bg-surface-ivory gap-3">
        <div className="space-y-0.5">
          <CardTitle className="text-base font-semibold text-foreground">
            Ledger Transaction Records
          </CardTitle>
          <CardDescription className="text-xs">
            Immutable journal entries verified across asynchronous database nodes
          </CardDescription>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, beneficiary..."
              className="h-8 pl-8 text-xs w-48 sm:w-60 bg-card"
            />
          </div>

          {/* Export CSV action */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert("Downloading signed CSV statement...")}
            className="h-8 gap-1.5 text-xs"
          >
            <DownloadIcon className="size-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </CardHeader>

      {/* Status Segment Pills */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border/50 px-4 py-2 bg-surface-ivory/50 text-xs">
        {["ALL", "PAID", "PENDING", "OVERDUE", "DECLINED"].map((st) => (
          <button
            key={st}
            onClick={() => {
              setStatusFilter(st);
              setCurrentPage(1);
            }}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
              statusFilter === st
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {st}
          </button>
        ))}
      </div>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell">Beneficiary</TableHead>
              <TableHead className="hidden lg:table-cell">Category</TableHead>
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead className="hidden sm:table-cell w-[100px]">Date</TableHead>
              <TableHead className="text-right w-[130px]">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">
                  No ledger transactions matching the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              pageTransactions.map((tx) => {
                const isCredit = tx.type === "CREDIT";

                return (
                  <TableRow key={tx.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-medium text-foreground">
                      {tx.referenceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs text-foreground leading-snug">
                          {tx.description}
                        </span>
                        <span className="text-[11px] text-muted-foreground sm:hidden">
                          {tx.counterparty}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {tx.counterparty}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {tx.category}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={tx.status} />
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                      {tx.postedAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-mono text-xs font-semibold tabular-nums",
                          isCredit ? "text-emerald-600" : "text-foreground"
                        )}
                      >
                        {isCredit ? "+" : "-"}
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: tx.currency,
                        }).format(tx.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-border/60 bg-surface-ivory py-3 px-4 text-xs text-muted-foreground">
        <div>
          Showing{" "}
          <span className="font-mono font-medium text-foreground">
            {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
          </span>{" "}
          to{" "}
          <span className="font-mono font-medium text-foreground">
            {Math.min(currentPage * itemsPerPage, filtered.length)}
          </span>{" "}
          of{" "}
          <span className="font-mono font-medium text-foreground">
            {filtered.length}
          </span>{" "}
          records
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="size-7"
          >
            <ChevronLeftIcon className="size-3.5" />
          </Button>
          <span className="font-mono text-xs px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="size-7"
          >
            <ChevronRightIcon className="size-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
