"use client";

import React, { useState } from "react";
import {
  publicClient,
  bundlerClient,
  paymasterClient,
  pimlicoClient,
} from "@/lib/clients";
import {
  Implementation,
  toMetaMaskSmartAccount,
} from "@metamask/delegation-toolkit";
import { toHex, http, parseEther } from "viem";
import { useSession } from "next-auth/react";
import { toWebAuthnAccount } from "viem/account-abstraction";
import { constructTransaction } from "@/lib/actions";

const CreateSmartAccount = () => {
  const { data: session } = useSession();
  console.log(session?.cards[0]);

  const card = session?.cards[0];
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<
    | "idle"
    | "creatingSmartAccount"
    | "creatingPasskey"
    | "addingBackupSigner"
    | "sendingTx"
    | "done"
  >("idle");

  const [error, setError] = useState<string | null>(null);

  const [txHash, setTxHash] = useState<string | null>(null);

  // STEP 4: SEND TRANSACTION USING PASSKEY SIGNER
  const handleSendTxWithPasskey = async () => {
    setLoading(true);
    setStep("sendingTx");
    setError(null);

    try {
      const recipient = "0x8cc55e80959C307D5425F8658787c2D110d68357";
      const value = parseEther("0.0001");

      console.log(card);

      const testing = await constructTransaction(
        "Oya now",
        "0x8cc55e80959c307d5425f8658787c2d110d68357",
        "3",
        { token: "USDC" }
      );

      console.log(testing);

      const passkeyCredential = card?.passkeyCredential;
      const webAuthAccount = card?.webAuthnAccount;

      console.log(passkeyCredential);
      console.log("Real webAuthnAccount", webAuthAccount);

      const webAuthnAccount = toWebAuthnAccount({
        credential: {
          id: passkeyCredential.id,
          publicKey: passkeyCredential.publicKey,
        },
      });

      console.log("Test webAuthnAccount", webAuthnAccount);

      const testSmartAccount = await toMetaMaskSmartAccount({
        client: publicClient as unknown as import("viem").PublicClient,
        implementation: Implementation.Hybrid,
        deployParams: [card?.eoaAddress as `0x${string}`, [], [], []],
        deploySalt: "0x",
        signer: { webAuthnAccount, keyId: toHex(passkeyCredential.id) },
      });

      console.log("Reused Smart Account Address:", testSmartAccount.address);
      console.log("Original Smart Account: ", card?.address);

      const call = { to: recipient, value, data: "0x" };

      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      const userOpHash = await bundlerClient.sendUserOperation({
        account: testSmartAccount,
        calls: [testing.data?.call as any],
        ...testing.data?.fee,
        paymaster: paymasterClient,
      });

      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      if (receipt?.receipt?.transactionHash) {
        setTxHash(receipt.receipt.transactionHash);
      }

      console.log("Transaction sent with passkey signer!");

      setStep("done");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to send transaction using passkey");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white px-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Smart Account Setup
        </h1>

        <>
          <p className="text-center text-sm text-neutral-400 mb-4">
            Connected:{" "}
            <span className="text-green-400 font-mono">
              {/* {address?.slice(0, 6)}...{address?.slice(-4)} */}
            </span>
          </p>

          <div className="space-y-4">
            <button
              onClick={handleSendTxWithPasskey}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium transition ${
                step === "sendingTx"
                  ? "bg-gray-600 cursor-wait"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {step === "sendingTx"
                ? "Sending Transaction..."
                : "Send Transaction Using Passkey"}
            </button>
          </div>

          {txHash && (
            <div className="mt-4 text-center">
              <h3 className="text-sm text-neutral-400">Transaction Hash:</h3>
              <a
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline break-all font-mono"
              >
                {txHash}
              </a>
            </div>
          )}

          {error && (
            <div className="mt-4 text-center text-red-500 text-sm">{error}</div>
          )}
        </>
        {/* {isConnected ? (
        
        ) : (
          <p className="text-center text-neutral-400 mt-6 text-sm">
            Please connect your wallet to continue.
          </p>
        )} */}
      </div>

      <footer className="mt-8 text-neutral-600 text-sm">
        Built with MetaMask Delegation Toolkit + Pimlico + WebAuthn
      </footer>
    </div>
  );
};

export default CreateSmartAccount;
