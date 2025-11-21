"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Loader2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import {
  createDelegation,
  getSmartAccountsEnvironment,
} from "@metamask/smart-accounts-kit";
import { baseSepolia } from "viem/chains";
import { parseUnits, toHex } from "viem";
import { useCardCreation } from "@/context/test/CardCreationContext";
import { useSession, signIn } from "next-auth/react";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { privateKeyToAccount } from "viem/accounts";
import {
  pimlicoClient,
  publicClient,
  bundlerClient,
  paymasterClient,
} from "@/lib/clients";
import { base64url } from "@scure/base";
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";

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
  const router = useRouter();
  const wallet = params.address as string;
  const { data: session, update } = useSession();

  const {
    setSmartAccount,
    setSmartAccountAddress,
    smartAccountAddress,
    smartAccount,
    step,
    setStep,
    error: cardError,
    setError: setCardError,
    passkeyName,
    setPasskeyName,
    cardName,
    setCardName,
    message,
    isDeploying,
    isCreatingPasskey,
    isAddingPasskey,
    isMinting,
    handleCreateAndDeploySmartAccount,
    createPasskey,
    handleAddPasskeyAsBackupSigner,
    handleMintCard,
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
  const [showCardCreation, setShowCardCreation] = useState(false);
  const [card, setCard] = useState<{
    identifier: string;
    address: string;
    eoaAddress: string;
    passkeyCredential: any;
    webAuthnAccount: any;
  } | null>(() => session?.cards?.[0] ?? null);

  const [delegateForm, setDelegateForm] = useState({
    amount: "",
    periodSeconds: "",
    startDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    if (session?.cards?.[0]) {
      setCard(session.cards[0]);
    }
  }, [session]);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!wallet) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/business/${wallet}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch business information");
        }

        let alreadyAuthorized = false;

        if (session?.user) {
          const authorizedAppsResponse = await fetch(`/api/authorizedapps`);
          const authorizedAppsData = await authorizedAppsResponse.json();

          const matchedAuth = authorizedAppsData.authorizations.find(
            (auth: any) => auth.businessWallet === wallet
          );

          alreadyAuthorized = !!matchedAuth;
        }

        setBusiness(data.business);
        setIsAuthorized(alreadyAuthorized);
      } catch (err: any) {
        setError(err.message || "Failed to load app information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [wallet, session]);

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

  useEffect(() => {
    if (step === "done" && showCardCreation) {
      const refreshSession = async () => {
        setShowCardCreation(false);
        setStep("deploy");

        await update();

        setTimeout(() => {
          router.refresh();
        }, 500);
      };

      refreshSession();
    }
  }, [step, showCardCreation, router, setStep, update]);

  const handlePeriodChange = (value: string) => {
    setDelegateForm((prev) => ({ ...prev, periodSeconds: value }));
  };

  const handleStartCardCreation = () => {
    setShowCardCreation(true);
    setStep("deploy");
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

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const startDate = Math.floor(new Date().getTime() / 1000);

      const privateKey = session?.privateKey as `0x${string}`;
      const account = privateKeyToAccount(privateKey);

      const passkeyCredential = card?.passkeyCredential;

      const webAuthnAccount = toWebAuthnAccount({
        credential: {
          id: passkeyCredential.id,
          publicKey: passkeyCredential.publicKey,
        },
      });

      const reconstructSmartAccount = await toMetaMaskSmartAccount({
        client: publicClient as unknown as import("viem").PublicClient,
        implementation: Implementation.Hybrid,
        deployParams: [account.address, [], [], []],
        deploySalt: "0x",
        signer: { webAuthnAccount, keyId: toHex(passkeyCredential.id) },
      });

      const delegation = createDelegation({
        scope: {
          type: "erc20PeriodTransfer",
          tokenAddress: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
          periodAmount: parseUnits(delegateForm.amount.toString(), 6),
          periodDuration: Number(delegateForm.periodSeconds),
          startDate,
        },
        to: wallet as `0x${string}`,
        from: smartAccountAddress as `0x${string}`,
        environment: reconstructSmartAccount.environment,
      });

      const signature = await reconstructSmartAccount.signDelegation({
        delegation,
      });

      const signedDelegation = {
        ...delegation,
        signature,
      };

      const serialized = base64url.encode(
        new TextEncoder().encode(JSON.stringify(signedDelegation))
      );

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

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        throw new Error(
          errorData?.error || "Failed to save authorization to the server"
        );
      }

      setSubmitStatus({
        type: "success",
        message: "Delegation created successfully!",
      });

      setIsAuthorized(true);

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

  // No session - show sign in prompt
  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-neutral-900 text-white border-neutral-800">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-amber-500/20 to-orange-500/20 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No Atlas Card Found</h2>
              <p className="text-neutral-400">
                You need an Atlas Card to authorize apps. Sign in to create one.
              </p>
            </div>

            <Button
              onClick={() => signIn("google")}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl"
            >
              Sign In to Create Card
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session && !card && !showCardCreation) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-neutral-900 text-white border-neutral-800">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-amber-500/20 to-orange-500/20 rounded-full mb-4">
              <CreditCard className="w-8 h-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Create Your Atlas Card</h2>
              <p className="text-neutral-400">
                You need to create an Atlas Card to authorize apps and manage
                delegations.
              </p>
            </div>

            <Button
              onClick={handleStartCardCreation}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl"
            >
              Create Atlas Card
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showCardCreation) {
    return (
      <div className="min-h-screen bg-black py-10 px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-neutral-900/40 backdrop-blur-xl border border-neutral-800/40 rounded-2xl text-white">
            <CardHeader className="border-b border-neutral-800/30 pb-5">
              <CardTitle className="text-2xl font-semibold tracking-wide">
                Create Your Atlas Card
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {cardError && (
                <Alert className="bg-red-950/40 border-red-700 text-red-300">
                  <AlertCircle className="h-5 w-5" />
                  <AlertDescription className="ml-2">
                    {cardError}
                  </AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="bg-blue-950/40 border-blue-700 text-blue-300">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <AlertDescription className="ml-2">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              {step === "deploy" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Step 1: Deploy Smart Account
                  </h3>
                  <p className="text-neutral-400">
                    Create and deploy your smart contract wallet on the
                    blockchain.
                  </p>
                  <Button
                    onClick={handleCreateAndDeploySmartAccount}
                    disabled={isDeploying}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl"
                  >
                    {isDeploying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Deploying...
                      </>
                    ) : (
                      "Deploy Smart Account"
                    )}
                  </Button>
                </div>
              )}

              {step === "passkey" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Step 2: Create Passkey
                  </h3>
                  <p className="text-neutral-400">
                    Set up biometric authentication for secure access to your
                    card.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-sm text-neutral-300">
                      Passkey Name
                    </Label>
                    <Input
                      value={passkeyName}
                      onChange={(e) => setPasskeyName(e.target.value)}
                      placeholder="e.g., My Atlas Passkey"
                      className="bg-black/70 border border-neutral-800/50 rounded-xl text-white"
                    />
                  </div>
                  <Button
                    onClick={createPasskey}
                    disabled={isCreatingPasskey || !passkeyName.trim()}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl"
                  >
                    {isCreatingPasskey ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating Passkey...
                      </>
                    ) : (
                      "Create Passkey"
                    )}
                  </Button>
                </div>
              )}

              {step === "add passkey" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Step 3: Add Passkey to Account
                  </h3>
                  <p className="text-neutral-400">
                    Link your passkey to your smart account for secure
                    transactions.
                  </p>
                  <Button
                    onClick={handleAddPasskeyAsBackupSigner}
                    disabled={isAddingPasskey}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl"
                  >
                    {isAddingPasskey ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Adding Passkey...
                      </>
                    ) : (
                      "Add Passkey"
                    )}
                  </Button>
                </div>
              )}

              {step === "mint" && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">
                    Step 4: Name Your Card
                  </h3>
                  <p className="text-neutral-400">
                    Give your Atlas Card a unique name.
                  </p>
                  <div className="space-y-2">
                    <Label className="text-sm text-neutral-300">
                      Card Name
                    </Label>
                    <Input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="e.g., My Main Card"
                      className="bg-black/70 border border-neutral-800/50 rounded-xl text-white"
                    />
                  </div>
                  <Button
                    onClick={handleMintCard}
                    disabled={isMinting || !cardName.trim()}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl"
                  >
                    {isMinting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating Card...
                      </>
                    ) : (
                      "Create Card"
                    )}
                  </Button>
                </div>
              )}

              {/* Step 5: Done */}
              {step === "done" && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-900/30 rounded-full mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold">Card Created!</h3>
                  <p className="text-neutral-400">
                    Your Atlas Card has been created successfully.
                    Redirecting...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating
                  Delegation...
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
