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
import CreateSmartAccount from "@/components/general/SendTestTx";

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
      <CreateSmartAccount />
    </main>
  );
}
