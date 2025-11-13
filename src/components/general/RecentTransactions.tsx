import React from "react";
import { ListFilter, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface RowItem {
  name: string;
  date: string;
  amount: string;
  creditOrDebit: "credit" | "debit";
  state: "successful" | "failed" | "pending";
}

const transactions: RowItem[] = [
  {
    name: "Netflix Subscription",
    date: "2025-11-01",
    amount: "$12.99",
    creditOrDebit: "debit",
    state: "successful",
  },
  {
    name: "Salary Credit",
    date: "2025-11-03",
    amount: "$1,200.00",
    creditOrDebit: "credit",
    state: "successful",
  },
  {
    name: "Electricity Bill",
    date: "2025-11-05",
    amount: "$85.60",
    creditOrDebit: "debit",
    state: "pending",
  },
  {
    name: "Data Purchase (AT&T)",
    date: "2025-11-06",
    amount: "$20.00",
    creditOrDebit: "debit",
    state: "failed",
  },
  {
    name: "Transfer from John Doe",
    date: "2025-11-07",
    amount: "$250.00",
    creditOrDebit: "credit",
    state: "successful",
  },
  {
    name: "POS Withdrawal",
    date: "2025-11-08",
    amount: "$100.00",
    creditOrDebit: "debit",
    state: "successful",
  },
  {
    name: "Amazon Purchase",
    date: "2025-11-09",
    amount: "$45.75",
    creditOrDebit: "debit",
    state: "successful",
  },
  {
    name: "Interest Credit",
    date: "2025-11-10",
    amount: "$3.50",
    creditOrDebit: "credit",
    state: "successful",
  },
  {
    name: "Sports Deposit",
    date: "2025-11-10",
    amount: "$60.00",
    creditOrDebit: "debit",
    state: "failed",
  },
  {
    name: "Refund from eBay",
    date: "2025-11-11",
    amount: "$35.20",
    creditOrDebit: "credit",
    state: "pending",
  },
];

const RecentTransactions = () => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl text-white">Recent Transactions</h2>
        <div className="flex gap-2">
          <ListFilter color="white" />
          <Plus color="white" />
        </div>
      </div>
      <div className="h-[88vh] overflow-y-scroll no-scrollbar">
        {transactions.map((tx, idx) => (
          <div key={idx}>
            <Row {...tx} />
          </div>
        ))}
      </div>
    </>
  );
};

const Row = ({ name, date, amount, creditOrDebit, state }: RowItem) => {
  return (
    <div className="flex items-center justify-between w-full bg-black text-white md:py-3 md:px-4 py-1.5 px-2 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white" />
        <div className="flex flex-col">
          <span className="text-xs md:text-sm font-medium">{name}</span>
          <span className="text-[10px] md:text-xs text-gray-400">{date}</span>
        </div>
      </div>

      <div className="flex items-end flex-col gap-1">
        <span className={cn("text-xs md:text-sm font-semibold")}>
          {creditOrDebit === "credit" ? "+" : "-"}
          {amount}
        </span>

        <span
          className={cn(
            "text-[10px] md:text-xs px-1.5 md:px-3 py-1 rounded-full capitalize font-medium",
            state === "successful" && "bg-green-600/20 text-green-400",
            state === "pending" && "bg-yellow-600/20 text-yellow-400",
            state === "failed" && "bg-red-600/20 text-red-400"
          )}
        >
          {state}
        </span>
      </div>
    </div>
  );
};

export default RecentTransactions;
