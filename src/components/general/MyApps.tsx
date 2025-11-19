"use client";

import React, { useState, useEffect } from "react";
import { X, Shield, Calendar } from "lucide-react";
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
import { getSmartAccountsEnvironment } from "@metamask/smart-accounts-kit";

interface IBusiness {
  _id: string;
  name: string;
  wallet: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthorizedApp {
  businessWallet: string;
  delegation: string;
  createdAt: string;
  business?: IBusiness;
}

export default function MyApps() {
  const { data: session } = useSession();
  const [authorizedApps, setAuthorizedApps] = useState<AuthorizedApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingWallet, setRemovingWallet] = useState<string | null>(null);
  const {
    setSmartAccount,
    setSmartAccountAddress,
    smartAccountAddress,
    smartAccount,
  } = useCardCreation();

  useEffect(() => {
    fetchAuthorizedApps();
  }, []);

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

  const fetchAuthorizedApps = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch authorized apps
      const authorizedAppsResponse = await fetch(`/api/authorizedapps`);
      const authorizedAppsData = await authorizedAppsResponse.json();

      if (!authorizedAppsResponse.ok) {
        throw new Error(
          authorizedAppsData.error || "Failed to fetch authorized apps"
        );
      }

      // Fetch business information for each authorized app
      const appsWithBusinessInfo = await Promise.all(
        authorizedAppsData.authorizations.map(async (auth: any) => {
          try {
            const businessResponse = await fetch(
              `/api/business/${auth.businessWallet}`
            );
            const businessData = await businessResponse.json();

            if (businessResponse.ok && businessData.business) {
              return {
                ...auth,
                business: businessData.business,
              };
            }

            return auth;
          } catch (err) {
            console.error(
              `Failed to fetch business for wallet ${auth.businessWallet}:`,
              err
            );
            return auth;
          }
        })
      );

      console.log(appsWithBusinessInfo);
      setAuthorizedApps(appsWithBusinessInfo);
    } catch (err: any) {
      setError(err.message || "Failed to load authorized apps");
    } finally {
      setIsLoading(false);
    }
  };

  function deserializeDelegation(encoded: string) {
    const jsonString = new TextDecoder().decode(base64url.decode(encoded));
    return JSON.parse(jsonString);
  }

  const removeDelegation = async (delegation: string, wallet: string) => {
    if (!delegation) return;

    if (
      !confirm("Are you sure you want to remove authorization for this app?")
    ) {
      return;
    }

    setRemovingWallet(wallet);

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

      const response = await fetch(
        `/api/authorizedapps?businessWallet=${deserializedDelegation.delegate}&smartAccountAddress=${smartAccount.address}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove authorization");
      }

      setAuthorizedApps((prev) =>
        prev.filter((app) => app.businessWallet !== wallet)
      );
      console.log("Delegation removed from backend successfully");
    } catch (err: any) {
      alert(err.message || "Failed to remove authorization");
    } finally {
      setRemovingWallet(null);
    }
  };

  //   const handleRemoveAuthorization = async (wallet: string) => {
  //     if (
  //       !confirm("Are you sure you want to remove authorization for this app?")
  //     ) {
  //       return;
  //     }

  //     setRemovingWallet(wallet);

  //     try {
  //       const response = await fetch(`/api/authorizedapps/${wallet}`, {
  //         method: "DELETE",
  //       });

  //       if (!response.ok) {
  //         const data = await response.json();
  //         throw new Error(data.error || "Failed to remove authorization");
  //       }

  //       setAuthorizedApps((prev) =>
  //         prev.filter((app) => app.businessWallet !== wallet)
  //       );
  //     } catch (err: any) {
  //       alert(err.message || "Failed to remove authorization");
  //     } finally {
  //       setRemovingWallet(null);
  //     }
  //   };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2 text-slate-600">
              <div
                className="w-2 h-2 bg-[#FEB600] rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#FEB600] rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 bg-[#FEB600] rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-lg font-medium mb-2">
              Error Loading Apps
            </div>
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <div className="flex items-center gap-1 mb-3">
            <Shield className="md:w-8 md:h-8 h-4 w-4 text-blue-400" />
            <h1 className="sm:text-xl text-lg md:text-2xl font-bold">
              Authorized Apps
            </h1>
          </div>
          <p className="text-neutral-400 text-sm md:text-md">
            Manage applications that have access to your account
          </p>
        </div>

        {/* Empty State */}
        {authorizedApps.length === 0 ? (
          <div className="rounded-xl p-12 text-center backdrop-blur">
            <Shield className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-200 mb-2">
              No Authorized Apps
            </h3>
            <p className="text-neutral-500">
              You have not granted access to any apps yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {authorizedApps.map((app) => (
              <div
                key={app.businessWallet}
                className="bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-xl shadow-[0_0_25px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_35px_-5px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300 hover:border-neutral-600 hover:bg-neutral-900/80"
              >
                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    {app.business?.logo ? (
                      <img
                        src={app.business.logo}
                        alt={app.business.name}
                        className="w-14 h-14 rounded-lg object-cover border border-neutral-700 bg-neutral-950 shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-blue-500 via-teal-500 to-green-600 flex items-center justify-center border border-neutral-700 shadow-[0_0_25px_-8px_rgba(0,255,200,0.4)]">
                        <span className="text-white text-xl font-bold tracking-wide">
                          {app.business?.name?.charAt(0) || "?"}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 overflow-hidden">
                      <h3 className="text-lg font-semibold text-neutral-200 tracking-tight truncate">
                        {app.business?.name || "Unknown App"}
                      </h3>

                      <p className="text-[10px] text-neutral-500 font-mono tracking-wide truncate mt-0.5">
                        {app.businessWallet}
                      </p>
                    </div>
                  </div>

                  {app.business?.createdAt && (
                    <div className="flex items-center text-xs text-neutral-500">
                      <Calendar className="w-3.5 h-3.5 mr-2 text-neutral-500" />
                      Authorized {formatDate(app.createdAt)}
                    </div>
                  )}

                  <button
                    onClick={() =>
                      removeDelegation(app.delegation, app.businessWallet)
                    }
                    disabled={removingWallet === app.businessWallet}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-red-900/20 border border-red-700/40 text-red-300 hover:bg-red-900/40 hover:border-red-600 transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_10px_-4px_rgba(255,0,0,0.3)]"
                  >
                    {removingWallet === app.businessWallet ? (
                      <>
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm">Removing...</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          Remove Access
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
