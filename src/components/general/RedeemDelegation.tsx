"use client";

import React, { useState } from "react";
import { recoverDelegation } from "@/lib/actions";

export default function RecoverDelegationForm() {
  const [delegation, setDelegation] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTxHash(null);
    setError(null);

    try {
      const hash = await recoverDelegation(
        delegation,
        privateKey as `0x${string}`,
        amount
      );
      if (hash) {
        setTxHash(hash);
      } else {
        setError("Transaction failed or returned null");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl w-full max-w-md space-y-4 text-white"
      >
        <h2 className="text-2xl font-semibold text-center">
          Recover Delegation
        </h2>

        <div className="flex flex-col">
          <label className="mb-1">Delegation</label>
          <input
            type="text"
            value={delegation}
            onChange={(e) => setDelegation(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
            placeholder="Enter delegation string"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1">Private Key</label>
          <input
            type="text"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
            placeholder="0x..."
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="p-2 rounded bg-gray-700 border border-gray-600 text-white"
            placeholder="Amount to redeem"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-amber-500 hover:bg-amber-600 rounded font-semibold text-black"
        >
          {isSubmitting ? "Processing..." : "Recover Delegation"}
        </button>

        {txHash && (
          <p className="mt-2 text-green-400 break-all">
            Transaction Hash: {txHash}
          </p>
        )}

        {error && <p className="mt-2 text-red-400 break-all">Error: {error}</p>}
      </form>
    </div>
  );
}
