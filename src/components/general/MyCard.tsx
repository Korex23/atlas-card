"use client";
import React, { useEffect, useState } from "react";
import { Space_Grotesk } from "next/font/google";
import { Copy, Check } from "lucide-react";
import Image from "next/image";
import atlas from "@/assets/atlas.webp";
import logo from "@/assets/logo.png";
import topglow from "@/assets/top-glow.png";
import bottomglow from "@/assets/bottom-glow.png";
import { useCardCreation } from "@/context/test/CardCreationContext";
import { useSession } from "next-auth/react";
import {
  toMetaMaskSmartAccount,
  Implementation,
} from "@metamask/delegation-toolkit";
import { privateKeyToAccount } from "viem/accounts";
import { publicClient } from "@/lib/clients";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

const AtlasCard = () => {
  const { data: session } = useSession();
  const card = session?.cards?.[0];
  const { setSmartAccount, setSmartAccountAddress, smartAccountAddress } =
    useCardCreation();
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    if (!smartAccountAddress) {
      console.warn("No address to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(smartAccountAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formattedAddress = smartAccountAddress
    ? `${smartAccountAddress.slice(0, 6)}...${smartAccountAddress.slice(-6)}`
    : "••••••••••";

  return (
    <div className="mx-auto w-[330px] min-[400px]:w-[350px] sm:w-[350px] md:w-[450px] rounded-lg p-[0.5px] bg-linear-to-br from-[#5734F2]/40 via-20% via-white/40 via-60% to-[#FEB601]/40 relative mt-5 hover:scale-[1.02] transition-transform">
      <div className="w-full h-[250px] rounded-lg px-6 py-4 bg-black relative overflow-hidden">
        <div className="absolute z-30 top-0 left-1/2 -translate-x-1/2 w-full">
          <Image src={topglow} alt="Top Glow" width={700} height={500} />
        </div>
        <div className="absolute z-30 bottom-0 right-0">
          <Image
            src={bottomglow}
            alt="Bottom Glow"
            width={460}
            height={120}
            className="opacity-90"
          />
        </div>
        <div className="absolute left-10 top-2 z-5 opacity-80">
          <Image
            src={atlas}
            alt="Atlas Card"
            width={200}
            height={120}
            className="rotate-12"
          />
        </div>
        <Image src={logo} alt="Atlas Logo" width={50} height={30} />
        <div className="flex justify-between h-full items-end pb-10 text-white z-40">
          <div className="z-50 relative flex items-center">
            <span
              className={`${spaceGrotesk.className} tracking-widest text-sm sm:text-md md:text-xl lg:text-2xl`}
            >
              {formattedAddress}
            </span>
            <button
              onClick={handleCopy}
              disabled={!smartAccountAddress}
              className="ml-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Copy address"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3 hover:opacity-70" />
              )}
            </button>
          </div>

          <div className="z-20">
            <span
              className={`${spaceGrotesk.className} uppercase text-xs sm:text-sm md:text-base`}
            >
              {card?.identifier}.pay
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtlasCard;
