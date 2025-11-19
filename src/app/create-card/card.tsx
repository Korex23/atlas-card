"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import deploy from "@/components/icons/svgs/create-card.svg";
import passkey from "@/components/icons/svgs/create-passkey.svg";
import addpasskey from "@/components/icons/svgs/add-passkey.svg";
import addcard from "@/components/icons/svgs/add-card.svg";
import { Button } from "@/components/ui/button";
import AtlasCard from "@/components/general/AtlasCard";
import { useCardCreation } from "@/context/test/CardCreationContext";

export default function CreateCard() {
  const steps = ["deploy", "passkey", "add passkey", "mint"];
  const stepLabels: Record<string, string> = {
    deploy: "Deploy Smart Account",
    passkey: "Create Passkey",
    "add passkey": "Add Passkey to Account",
    mint: "Mint Card",
  };
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialStep = searchParams.get("step") as
    | "add passkey"
    | "deploy"
    | "passkey"
    | "mint"
    | "done"
    | null;

  const {
    step,
    setStep,
    error,
    setError,
    passkeyCredential,
    smartAccountAddress,
    userOperationHash,
    txHash,
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

  const [showPasskeyForm, setShowPasskeyForm] = useState<boolean>(false);
  const [showCardForm, setShowCardForm] = useState<boolean>(false);

  useEffect(() => {
    if (initialStep && steps.includes(initialStep)) {
      setStep(initialStep);
    }
  }, [initialStep, setStep]);

  useEffect(() => {
    router.replace(`?step=${step}`);
  }, [step, router]);

  const handleBack = () => {
    if (step === "deploy") {
      router.back();
    } else {
      const currentIndex = steps.indexOf(step);
      if (currentIndex > 0) {
        setStep(steps[currentIndex - 1] as any);
      }
    }
  };

  // Loading component
  const LoadingState = ({ message }: { message: string }) => (
    <div className="text-center space-y-5 sm:space-y-6 flex flex-col items-center justify-center">
      <div className="w-20 h-20 border-4 border-[#FEB600] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-white text-sm sm:text-base animate-pulse">{message}</p>
    </div>
  );

  // Success component
  const SuccessState = ({
    message,
    txHash,
  }: {
    message: string;
    txHash?: string | null;
  }) => (
    <div className="text-center space-y-5 sm:space-y-6 flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 6L9 17L4 12"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="text-white text-sm sm:text-base">{message}</p>
      {txHash && (
        <a
          href={`https://sepolia.basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#FEB600] hover:text-[#e6a500] text-sm underline transition-colors"
        >
          View on Base Sepolia Scan
        </a>
      )}
    </div>
  );

  if (step === "done") {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
        <div className="h-screen flex justify-center items-center">
          <div className="text-center space-y-5 sm:space-y-6 flex flex-col items-center justify-center max-w-[600px] w-[95%]">
            <AtlasCard
              address={smartAccountAddress ?? ""}
              domain={`${cardName}.com`}
            />
            <h2 className="text-2xl font-semibold text-white">
              Card minted successfully!
            </h2>
            <p className="text-white/60 text-sm sm:text-base mb-4 sm:mb-6 ">
              Your smart card "{cardName}" has been successfully created and all
              data has been stored. You can now enjoy all premium features of
              your minted card and spend as you wish.
            </p>
            <div className="space-x-5">
              <Button
                className="bg-transparent border border-[#FEB601] rounded-2xl text-[#FEB601] focus:outline-none hover:bg-[#FEB601] hover:text-black"
                onClick={() => {
                  router.push("/");
                }}
              >
                Go to Homepage
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="hover:stroke-black"
                >
                  <path
                    d="M12 20.0002L4 12.0002M4 12.0002L12 4.00024M4 12.0002H20C24.4183 12.0002 28 15.582 28 20.0002C28 24.4185 24.4183 28.0002 20 28.0002H16"
                    stroke="#E4A300"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              <Button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#FEB600] text-white rounded-2xl transition-colors">
                Fund Card
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 1H4C2.34315 1 1 2.34315 1 4V6M18 1H20C21.6569 1 23 2.34315 23 4V6M23 18V20C23 21.6569 21.6569 23 20 23H18M6 23H4C2.34315 23 1 21.6569 1 20V18M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
      <div className="bg-transparent min-h-screen flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1 flex items-center gap-2 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="20" cy="20" r="20" fill="white" />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.0661 16.4338C16.1832 16.5509 16.2489 16.7098 16.2489 16.8754C16.2489 17.0411 16.1832 17.1999 16.0661 17.3171L14.0078 19.3754H27.4995C27.6652 19.3754 27.8242 19.4413 27.9414 19.5585C28.0586 19.6757 28.1245 19.8347 28.1245 20.0004C28.1245 20.1662 28.0586 20.3252 27.9414 20.4424C27.8242 20.5596 27.6652 20.6254 27.4995 20.6254H14.0078L16.0661 22.6838C16.1275 22.741 16.1768 22.81 16.2109 22.8866C16.2451 22.9633 16.2635 23.0461 16.2649 23.13C16.2664 23.2139 16.251 23.2973 16.2196 23.3751C16.1881 23.4529 16.1413 23.5236 16.082 23.583C16.0226 23.6423 15.9519 23.6891 15.8741 23.7205C15.7963 23.752 15.7129 23.7674 15.629 23.7659C15.5451 23.7644 15.4623 23.7461 15.3857 23.7119C15.309 23.6778 15.24 23.6285 15.1828 23.5671L12.0578 20.4421C11.9407 20.3249 11.875 20.1661 11.875 20.0004C11.875 19.8348 11.9407 19.6759 12.0578 19.5588L15.1828 16.4338C15.3 16.3167 15.4588 16.251 15.6245 16.251C15.7901 16.251 15.9489 16.3167 16.0661 16.4338Z"
                fill="black"
              />
            </svg>
            Back
          </button>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Create A Card
            </h1>
          </div>

          <div className="backdrop-blur-lg rounded-2xl p-3 sm:p-5 shadow-2xl relative">
            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-xl text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-between items-center mb-10 overflow-x-auto scrollbar-hide px-1 sm:px-2">
              {steps.map((s, i) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center min-w-[70px] sm:min-w-[100px]">
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                        step === s
                          ? "bg-[#FEB601] text-white shadow-lg shadow-[#FEB601]/40"
                          : steps.indexOf(step) > steps.indexOf(s)
                          ? "bg-green-500 text-white shadow-md shadow-green-500/30"
                          : "bg-white/10 text-white/50"
                      }`}
                    >
                      {steps.indexOf(step) > steps.indexOf(s) ? "✓" : i + 1}
                    </div>
                    <span className="text-[10px] sm:text-xs text-white/70 text-center mt-1 capitalize whitespace-nowrap">
                      {stepLabels[s]}
                    </span>
                  </div>

                  {i < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 sm:mx-2 rounded transition-all duration-300 min-w-5 ${
                        steps.indexOf(step) > i ? "bg-green-500" : "bg-white/20"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="min-h-[250px] sm:min-h-[300px] flex flex-col justify-center px-2 sm:px-4">
              {step === "deploy" && (
                <div className="text-center space-y-5 sm:space-y-6 flex flex-col items-center justify-center">
                  {isDeploying ? (
                    <LoadingState message={message} />
                  ) : txHash ? (
                    <SuccessState
                      message="Smart account deployed successfully!"
                      txHash={txHash}
                    />
                  ) : (
                    <>
                      <Image
                        src={deploy}
                        alt="deploy"
                        width={200}
                        height={300}
                      />
                      <p className="text-white text-sm sm:text-base mb-4 sm:mb-6">
                        Create a smart account to securely manage your card and
                        use it as you wish without risk.
                      </p>
                      <Button
                        onClick={handleCreateAndDeploySmartAccount}
                        disabled={isDeploying}
                        className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#FEB600] text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeploying ? (
                          <>
                            Deploying...
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                          </>
                        ) : (
                          <>
                            Deploy Smart Account
                            <svg
                              width="24"
                              height="28"
                              viewBox="0 0 24 28"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M16.0564 26.8957L14.2447 20.1343M14.2447 20.1343L10.8988 23.1014L11.6567 10.475L18.6262 21.0308L14.2447 20.1343ZM12 1V4M19.7782 4.22183L17.6569 6.34315M23 12H20M6.34315 17.6569L4.22183 19.7782M4 12H1M6.34315 6.34315L4.22183 4.22183"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {step === "passkey" && (
                <div className="text-center space-y-5 sm:space-y-6 flex flex-col items-center justify-center">
                  {isCreatingPasskey ? (
                    <LoadingState message="Creating your passkey..." />
                  ) : passkeyCredential ? (
                    <SuccessState message="Passkey created successfully!" />
                  ) : (
                    <>
                      <Image
                        src={passkey}
                        alt="deploy"
                        width={200}
                        height={300}
                      />
                      <p className="text-white text-sm sm:text-base mb-4 sm:mb-6">
                        Securely sign in to your account using just your
                        fingerprint, face, screen lock or security key. Make
                        sure that you keep your screen locks private and
                        security keys safe, so that only you can use them.
                      </p>

                      {!showPasskeyForm ? (
                        <Button
                          onClick={() => setShowPasskeyForm(true)}
                          className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#FEB600] text-white rounded-2xl transition-colors"
                        >
                          Create new Passkey
                          <svg
                            width="22"
                            height="28"
                            viewBox="0 0 22 28"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="ml-2"
                          >
                            <path
                              d="M17 12V7C17 3.68629 14.3137 1 11 1C7.68629 1 5 3.68629 5 7V12M4 27H18C19.6569 27 21 25.6569 21 24V15C21 13.3431 19.6569 12 18 12H4C2.34315 12 1 13.3431 1 15V24C1 25.6569 2.34315 27 4 27Z"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Button>
                      ) : (
                        <div className="flex flex-col items-center space-y-4 w-full sm:w-[300px]">
                          <input
                            type="text"
                            placeholder="Passkey Name"
                            value={passkeyName}
                            onChange={(e) => setPasskeyName(e.target.value)}
                            className="w-full p-3 rounded-xl text-white focus:outline-none border border-[#FEB600] bg-transparent placeholder-white/50"
                          />
                          <Button
                            onClick={createPasskey}
                            disabled={isCreatingPasskey || !passkeyName.trim()}
                            className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#FEB600] text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                          >
                            {isCreatingPasskey ? (
                              <>
                                Creating...
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                              </>
                            ) : (
                              "Continue"
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {step === "add passkey" && (
                <div className="text-center space-y-5 sm:space-y-6 flex flex-col items-center justify-center">
                  {isAddingPasskey ? (
                    <LoadingState message={message} />
                  ) : userOperationHash ? (
                    <SuccessState message="Passkey added successfully!" />
                  ) : (
                    <>
                      <Image
                        src={addpasskey}
                        alt="deploy"
                        width={200}
                        height={300}
                      />
                      <p className="text-white text-sm sm:text-base mb-4 sm:mb-6">
                        Now that you have a passkey created, securely add this
                        created passkey to your deployed smart account to
                        protect your account.
                      </p>
                      <Button
                        onClick={handleAddPasskeyAsBackupSigner}
                        disabled={isAddingPasskey}
                        className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#FEB600] text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isAddingPasskey ? (
                          <>
                            Adding Passkey...
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                          </>
                        ) : (
                          <>
                            Add Passkey to Account
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 28 28"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M15.587 9.58456C16.1857 9.87055 16.7468 10.2615 17.2426 10.7574C19.5858 13.1005 19.5858 16.8995 17.2426 19.2426L11.2426 25.2426C8.8995 27.5858 5.10051 27.5858 2.75736 25.2426C0.414213 22.8995 0.414213 19.1005 2.75736 16.7574L5.09999 14.4147M22.9 13.5853L25.2426 11.2426C27.5858 8.8995 27.5858 5.10051 25.2426 2.75736C22.8995 0.414213 19.1005 0.414213 16.7574 2.75736L10.7574 8.75736C8.41421 11.1005 8.41421 14.8995 10.7574 17.2426C11.2532 17.7385 11.8143 18.1294 12.413 18.4154"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {step === "mint" && (
                <div className="text-center space-y-5 sm:space-y-6 flex flex-col items-center justify-center">
                  {isMinting ? (
                    <LoadingState message="Minting your card and storing data..." />
                  ) : showCardForm ? (
                    <div className="flex flex-col items-center space-y-4 w-full sm:w-[300px]">
                      <Image
                        src={addcard}
                        alt="deploy"
                        width={200}
                        height={300}
                      />
                      <p className="text-white text-sm sm:text-base mb-4 sm:mb-6">
                        Enter a unique name for your card. This will be stored
                        along with your account details.
                      </p>
                      <input
                        type="text"
                        placeholder="Enter card name"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full p-3 rounded-xl text-white focus:outline-none border border-[#FEB600] bg-transparent placeholder-white/50"
                      />
                      <div className="flex space-x-4 w-full">
                        <Button
                          onClick={() => setShowCardForm(false)}
                          className="px-6 sm:px-8 py-2.5 sm:py-3 bg-transparent border border-[#FEB600] text-[#FEB600] rounded-2xl transition-colors hover:bg-[#FEB600] hover:text-black flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleMintCard}
                          disabled={isMinting || !cardName.trim()}
                          className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#FEB600] text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1"
                        >
                          {isMinting ? (
                            <>
                              Minting...
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                            </>
                          ) : (
                            "Mint Card"
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Image
                        src={addcard}
                        alt="deploy"
                        width={200}
                        height={300}
                      />
                      <p className="text-white text-sm sm:text-base mb-4 sm:mb-6">
                        Your Passkey has been linked with your smart account,
                        you can now create your smart card to start making
                        secure transactions.
                      </p>
                      <Button
                        onClick={() => setShowCardForm(true)}
                        disabled={isMinting}
                        className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#FEB600] text-white rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <>
                          Mint Card
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M3 11.0004H29M3 12.0004H29M7 19.0004H15M7 22.0004H11M6 26.0004H26C27.6569 26.0004 29 24.6573 29 23.0004V9.00043C29 7.34357 27.6569 6.00043 26 6.00043H6C4.34315 6.00043 3 7.34357 3 9.00043V23.0004C3 24.6573 4.34315 26.0004 6 26.0004Z"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
