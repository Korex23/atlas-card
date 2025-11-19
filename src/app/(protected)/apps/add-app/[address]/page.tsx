"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Loader2,
  AlertCircle,
  Info,
  Clock,
  DollarSign,
  Calendar as Icon,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";
import {
  createDelegation,
  getSmartAccountsEnvironment,
} from "@metamask/smart-accounts-kit";
import { baseSepolia } from "viem/chains";
import { parseUnits } from "viem";
import { useCardCreation } from "@/context/test/CardCreationContext";
import { useSession } from "next-auth/react";
import { DelegationManager } from "@metamask/delegation-toolkit/contracts";
import {
  toMetaMaskSmartAccount,
  Implementation,
} from "@metamask/delegation-toolkit";
import { privateKeyToAccount } from "viem/accounts";
import {
  pimlicoClient,
  publicClient,
  bundlerClient,
  paymasterClient,
} from "@/lib/clients";
import { base64url } from "@scure/base";

interface Business {
  _id: string;
  name: string;
  wallet: string;
  description: string;
  logo: string;
  banner: string;
  createdAt: string;
  updatedAt: string;
}

const PERIODS = [
  { label: "Hourly", value: "3600", seconds: 3600 },
  { label: "6 Hours", value: "21600", seconds: 21600 },
  { label: "12 Hours", value: "43200", seconds: 43200 },
  { label: "Daily", value: "86400", seconds: 86400 },
  { label: "Weekly", value: "604800", seconds: 604800 },
];

export default function AddAppDelegate() {
  const params = useParams();
  const wallet = params.address as string;
  const { data: session } = useSession();
  const card = session?.cards?.[0];
  const {
    setSmartAccount,
    setSmartAccountAddress,
    smartAccountAddress,
    smartAccount,
  } = useCardCreation();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showMainTooltip, setShowMainTooltip] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [delegateForm, setDelegateForm] = useState({
    amount: "",
    periodSeconds: "",
    startDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!wallet) return;

      setIsLoading(true);
      setError(null);

      try {
        // Fetch business data
        const response = await fetch(`/api/business/${wallet}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch business information");
        }

        // Fetch authorized apps
        const authorizedAppsResponse = await fetch(`/api/authorizedapps`);
        const authorizedAppsData = await authorizedAppsResponse.json();

        // if (!authorizedAppsResponse.ok) {
        //   throw new Error(
        //     authorizedAppsData.error || "Failed to fetch authorized apps"
        //   );
        // }

        // Check if this wallet is already authorized
        const alreadyAuthorized = authorizedAppsData.authorizations.find(
          (auth: any) => auth.businessWallet === wallet
        );

        setBusiness(data.business);
        setIsAuthorized(!!alreadyAuthorized);
        console.log("Authorized apps:", authorizedAppsData.authorizations);
        console.log("Already authorized:", alreadyAuthorized);
      } catch (err: any) {
        setError(err.message || "Failed to load app information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [wallet]);

  const checkAuth = async () => {
    if (!wallet) return;

    setError(null);

    try {
      const authorizedAppsResponse = await fetch(`/api/authorizedapps`);
      const authorizedAppsData = await authorizedAppsResponse.json();

      const alreadyAuthorized = authorizedAppsData.authorizations.find(
        (auth: any) => auth.businessWallet === wallet
      );

      setIsAuthorized(!!alreadyAuthorized);
      console.log("Authorized apps:", authorizedAppsData.authorizations);
      console.log("Already authorized:", alreadyAuthorized);
    } catch (err: any) {
      setError(err.message || "Failed to load app information");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!session?.privateKey) return;

    async function setupSmartAccount() {
      try {
        const privateKey = session?.privateKey as `0x${string}`;
        const account = privateKeyToAccount(privateKey);

        const smartAccount = await toMetaMaskSmartAccount({
          client: publicClient as unknown as import("viem").PublicClient,
          implementation: Implementation.Hybrid,
          deployParams: [account.address, [], [], []],
          deploySalt: "0x",
          signer: { account },
        });

        setSmartAccount(smartAccount);
        setSmartAccountAddress(smartAccount.address);
      } catch (err) {
        console.error("Error generating smart account:", err);
      }
    }

    setupSmartAccount();
  }, [session?.privateKey, setSmartAccount, setSmartAccountAddress]);

  const handlePeriodChange = (value: string) => {
    setDelegateForm((prev) => ({ ...prev, periodSeconds: value }));
  };

  function deserializeDelegation(encoded: string) {
    const jsonString = new TextDecoder().decode(base64url.decode(encoded));
    return JSON.parse(jsonString);
  }

  const removeDelegation = async (delegation: string) => {
    if (!delegation) return;

    try {
      const deserializedDelegation = deserializeDelegation(delegation);

      const disableDelegationData = DelegationManager.encode.disableDelegation({
        delegation: deserializedDelegation,
      });

      const environment = getSmartAccountsEnvironment(baseSepolia.id);

      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [
          {
            to: environment.DelegationManager,
            data: disableDelegationData,
          },
        ],
        ...fee,
        paymaster: paymasterClient,
      });

      console.log("Delegation disabled successfully, UserOp hash:", userOpHash);

      await fetch(
        `/api/authorizedapps?businessWallet=${deserializedDelegation.delegate}&smartAccountAddress=${smartAccount.address}`,
        {
          method: "DELETE",
        }
      );

      console.log("Delegation removed from backend successfully");
    } catch (error: any) {
      console.error("Failed to remove delegation:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!delegateForm.amount || !delegateForm.periodSeconds) {
      setSubmitStatus({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }

    console.log("Delegate Form Data:", {
      appWallet: wallet,
      amount: delegateForm.amount,
      periodSeconds: parseInt(delegateForm.periodSeconds),
      startDate: delegateForm.startDate,
    });

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const startDate = Math.floor(new Date().getTime() / 1000);

      const delegation = createDelegation({
        scope: {
          type: "erc20PeriodTransfer",
          tokenAddress: "0xb4aE654Aca577781Ca1c5DE8FbE60c2F423f37da",
          periodAmount: parseUnits(delegateForm.amount.toString(), 6),
          periodDuration: Number(delegateForm.periodSeconds),
          startDate,
        },
        to: wallet as `0x${string}`,
        from: smartAccountAddress as `0x${string}`,
        environment: smartAccount.environment,
      });

      const signature = await smartAccount.signDelegation({ delegation });

      const signedDelegation = {
        ...delegation,
        signature,
      };

      const serialized = base64url.encode(
        new TextEncoder().encode(JSON.stringify(signedDelegation))
      );
      // Save authorization to backend
      const authResponse = await fetch("/api/authorizedapps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessWallet: wallet,
          businessName: business?.name,
          smartAccountAddress: smartAccountAddress,
          delegation: serialized,
        }),
      });

      // Check for API errors
      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(
          errorData?.error || "Failed to save authorization to the server"
        );
      }

      const authData = await authResponse.json();
      console.log("Authorization stored:", authData);
      console.log(signedDelegation);

      console.log("Serialized Delegation:", serialized);

      const delegating = deserializeDelegation(serialized);
      console.log("Recovered Delegation:", delegating);

      console.log("removing delegation for test");

      setSubmitStatus({
        type: "success",
        message: "Delegation created successfully!",
      });

      setIsAuthorized(true);
      await checkAuth();

      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 3000);
    } catch (error: any) {
      console.error("Delegation error:", error);
      setSubmitStatus({
        type: "error",
        message:
          error.message || "Failed to create delegation. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-neutral-900 text-white border-neutral-800">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="h-24 w-full bg-neutral-800 rounded animate-pulse" />
              <div className="h-64 w-full bg-neutral-800 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-neutral-900 text-white border-neutral-800">
          <CardContent className="pt-6">
            <Alert className="bg-red-950/50 border-red-700">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertDescription className="text-red-400 ml-2">
                {error || "App not found"}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-10 px-6">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* App Information Card */}
        <Card className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/40 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] text-white">
          <CardContent className="pt-8">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-black border border-neutral-800/60">
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-full h-full object-contain p-2"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-2xl font-bold tracking-wide">
                    {business.name}
                  </h1>

                  <Badge
                    className={`px-3 py-1 rounded-full text-xs tracking-wide border-none ${
                      isAuthorized
                        ? "bg-emerald-600/30 text-emerald-300"
                        : "bg-amber-600/30 text-amber-300"
                    }`}
                  >
                    {isAuthorized ? "Authorized" : "App"}
                  </Badge>
                </div>

                <p className="text-neutral-400 text-sm mb-3">
                  {business.description}
                </p>
                <p className="text-neutral-600 text-xs font-mono">
                  {business.wallet}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delegation Form */}
        <Card className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/40 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.8)] text-white">
          <CardHeader className="border-b border-neutral-800/30 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-semibold tracking-wide">
                  Delegate Access
                </CardTitle>
                <p className="text-neutral-400 text-sm mt-1">
                  Set spending limits for this app
                </p>
              </div>

              <button
                onClick={() => setShowMainTooltip(!showMainTooltip)}
                className="p-2 rounded-full hover:bg-neutral-800/40 transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-neutral-500" />
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {submitStatus.type && (
              <Alert
                className={`flex items-center gap-3 p-4 rounded-lg border ${
                  submitStatus.type === "success"
                    ? "bg-green-950/40 border-green-700 text-green-300"
                    : "bg-red-950/40 border-red-700 text-red-300"
                } shadow-lg`}
              >
                {submitStatus.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                )}

                <AlertDescription className="text-sm font-medium tracking-wide">
                  {submitStatus.message}
                </AlertDescription>
              </Alert>
            )}
            {/* Amount Field */}
            <div className="space-y-2">
              <Label className="text-sm text-neutral-300">
                Max Amount Per Period *
              </Label>
              <Input
                type="number"
                step="0.01"
                value={delegateForm.amount}
                onChange={(e) =>
                  setDelegateForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                placeholder="100.00"
                className="bg-black/70 border border-neutral-800/50 rounded-xl focus:border-amber-500 focus:ring-amber-500 text-white"
              />
            </div>

            {/* Period Select */}
            <div className="space-y-2">
              <Label className="text-sm text-neutral-300">Period *</Label>
              <Select
                value={delegateForm.periodSeconds}
                onValueChange={handlePeriodChange}
              >
                <SelectTrigger className="bg-black/70 border border-neutral-800/50 rounded-xl text-white focus:border-amber-500 focus:ring-amber-500">
                  <SelectValue placeholder="Select a period" />
                </SelectTrigger>

                <SelectContent className="bg-neutral-900 border-neutral-800 text-white rounded-xl">
                  {PERIODS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isAuthorized}
              className="w-full py-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold tracking-wide shadow-[0_0_25px_rgba(255,194,82,0.4)] transition-all"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  {" "}
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating
                  Delegation...{" "}
                </span>
              ) : isAuthorized ? (
                "Already Authorized"
              ) : (
                "Create Delegation"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
