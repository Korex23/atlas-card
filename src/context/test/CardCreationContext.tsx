"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
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
import { PublicKey } from "ox";
import { toHex, zeroAddress, Address } from "viem";
import {
  createWebAuthnCredential,
  toWebAuthnAccount,
} from "viem/account-abstraction";
import {
  P256Owner,
  HybridDeleGator,
} from "@metamask/delegation-toolkit/contracts";
import { connect, getBalance, storeCredentials } from "@/lib/actions";
import { useSession } from "next-auth/react";

interface CardCreationContextType {
  // State
  step: "add passkey" | "deploy" | "passkey" | "mint" | "done";
  setStep: (
    step: "add passkey" | "deploy" | "passkey" | "mint" | "done"
  ) => void;
  error: string | null;
  setError: (error: string | null) => void;
  passkeyCredential: any;
  setPasskeyCredential: (credential: any) => void;
  smartAccount: any;
  setSmartAccount: (account: any) => void;
  smartAccountAddress: Address | null;
  setSmartAccountAddress: (address: Address | null) => void;
  userOperationHash: string | null;
  setUserOperationHash: (hash: string | null) => void;
  webAuthnAccount: any;
  setWebAuthnAccount: (account: any) => void;
  txHash: string | null;
  setTxHash: (hash: string | null) => void;
  passkeyName: string;
  setPasskeyName: (name: string) => void;
  cardName: string;
  setCardName: (name: string) => void;
  generatedAccount: any;
  setGeneratedAccount: (account: any) => void;
  message: string;
  setMessage: (message: string) => void;
  isDeploying: boolean;
  setIsDeploying: (loading: boolean) => void;
  isCreatingPasskey: boolean;
  setIsCreatingPasskey: (loading: boolean) => void;
  isAddingPasskey: boolean;
  setIsAddingPasskey: (loading: boolean) => void;
  isMinting: boolean;
  setIsMinting: (loading: boolean) => void;
  handleCreateAndDeploySmartAccount: () => Promise<void>;
  createPasskey: () => Promise<void>;
  handleAddPasskeyAsBackupSigner: () => Promise<void>;
  handleMintCard: () => Promise<void>;
  getAllCards: () => any[];
  getCardByIndex: (index: number) => any;
  getCardByAddress: (address: string) => any;
  getLatestCard: () => any;
  updateCard: (index: number, updatedData: Partial<any>) => void;
  deleteCard: (index: number) => void;
  clearAllCards: () => void;
  getSmartAccountBalance: (address: Address) => Promise<
    {
      success: boolean;
      data?: { balance: any; token: string };
      error?: { message: string; name?: string; details?: string };
    }[]
  >;
}

const CardCreationContext = createContext<CardCreationContextType | undefined>(
  undefined
);

export const CardCreationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [step, setStep] = useState<
    "add passkey" | "deploy" | "passkey" | "mint" | "done"
  >("deploy");
  const [error, setError] = useState<string | null>(null);
  const [passkeyCredential, setPasskeyCredential] = useState<any>(null);
  const [smartAccount, setSmartAccount] = useState<any>(null);
  const [smartAccountAddress, setSmartAccountAddress] =
    useState<Address | null>(null);
  const [userOperationHash, setUserOperationHash] = useState<string | null>(
    null
  );
  const [webAuthnAccount, setWebAuthnAccount] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [passkeyName, setPasskeyName] = useState<string>("");
  const [cardName, setCardName] = useState<string>("");
  const [generatedAccount, setGeneratedAccount] = useState<any>(null);
  const [message, setMessage] = useState<string>("");

  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [isCreatingPasskey, setIsCreatingPasskey] = useState<boolean>(false);
  const [isAddingPasskey, setIsAddingPasskey] = useState<boolean>(false);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  const getSmartAccountBalance = async (
    address: `0x${string}`
  ): Promise<
    {
      success: boolean;
      data?: { balance: any; token: string };
      error?: { message: string; name?: string; details?: string };
    }[]
  > => {
    const tokens = ["USDC", "ETH"];

    const results = await Promise.all(
      tokens.map(async (token) => {
        const result = await getBalance(address, token);

        if (!result.success) {
          return {
            success: false,
            error: result.error,
          };
        }

        return {
          success: true,
          data: {
            balance: result.data?.balance,
            token: token,
          },
        };
      })
    );

    return results;
  };

  const handleCreateAndDeploySmartAccount = async () => {
    setIsDeploying(true);
    setError(null);

    const privateKey = session?.privateKey as `0x${string}`;
    const account = privateKeyToAccount(privateKey);
    setGeneratedAccount(account);

    console.log(account);

    setMessage("Creating Smart Account....");

    try {
      const smartAccount = await toMetaMaskSmartAccount({
        client: publicClient as unknown as import("viem").PublicClient,
        implementation: Implementation.Hybrid,
        deployParams: [account.address, [], [], []],
        deploySalt: "0x",
        signer: { account },
      });

      setSmartAccount(smartAccount);
      setSmartAccountAddress(smartAccount.address);

      console.log(smartAccount);
      console.log(smartAccount.address);

      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      setMessage("Deploying Smart Account....");

      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [{ to: zeroAddress }],
        ...fee,
        paymaster: paymasterClient,
      });

      const receipt = await bundlerClient.waitForUserOperationReceipt({
        hash: userOpHash,
      });

      if (receipt?.receipt?.transactionHash) {
        setTxHash(receipt.receipt.transactionHash);
      }

      console.log(receipt.receipt.transactionHash);
      setTimeout(() => {
        setStep("passkey");
      }, 3000);
    } catch (error: any) {
      console.error(error);
      setError(error?.message || "Error creating smart account.");
    } finally {
      setIsDeploying(false);
      setMessage("");
    }
  };

  const createPasskey = async () => {
    if (!smartAccount) {
      setError("Create a smart account first.");
      return;
    }

    if (!passkeyName.trim()) {
      setError("Please enter a passkey name.");
      return;
    }

    setIsCreatingPasskey(true);
    setError(null);

    try {
      const cred = await createWebAuthnCredential({
        name: passkeyName,
      });

      const authnAccount = toWebAuthnAccount({ credential: cred });
      setWebAuthnAccount(authnAccount);

      setPasskeyCredential(cred);
      setTimeout(() => {
        setStep("add passkey");
      }, 3000);
    } catch (error: any) {
      console.error(error);
      setError(error?.message || "Failed to create passkey.");
    } finally {
      setIsCreatingPasskey(false);
    }
  };

  const handleAddPasskeyAsBackupSigner = async () => {
    if (!smartAccount || !passkeyCredential) {
      setError("You need both a Smart Account and Passkey first.");
      return;
    }

    setIsAddingPasskey(true);
    setError(null);

    try {
      setMessage("Generating Public Credentials...");
      const publicKey = PublicKey.fromHex(passkeyCredential.publicKey);
      const p256Owner: P256Owner = {
        keyId: toHex(passkeyCredential.id),
        x: publicKey.x,
        y: publicKey.y,
      };

      const data = HybridDeleGator.encode.addKey({ p256Owner });

      const { fast: fee } = await pimlicoClient.getUserOperationGasPrice();

      setTimeout(() => {
        setMessage("Adding passkey to your account...");
      }, 1000);

      const userOpHash = await bundlerClient.sendUserOperation({
        account: smartAccount,
        calls: [{ to: smartAccount.address, data }],
        ...fee,
        paymaster: paymasterClient,
      });

      setUserOperationHash(userOpHash);
      console.log(userOpHash);
      setTimeout(() => {
        setStep("mint");
      }, 3000);
    } catch (error: any) {
      console.error(error);
      setError(error?.message || "Failed to add passkey as backup signer.");
    } finally {
      setIsAddingPasskey(false);
      setMessage("");
    }
  };

  const handleMintCard = async () => {
    if (!cardName.trim()) {
      setError("Please enter a card name.");
      return;
    }

    setIsMinting(true);
    setError(null);

    try {
      const test = await connect();
      console.log(test);
      const cardData = {
        cardName,
        smartAccount: smartAccountAddress,
        passkeyCredential,
        webAuthnAccount,
        generatedAccount: generatedAccount?.address,
        timestamp: new Date().toISOString(),
      };

      console.log("Storing card data:", cardData);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get existing cards from localStorage or initialize empty array
      const existingCardsJSON = localStorage.getItem("atlasCardss");
      const existingCards = existingCardsJSON
        ? JSON.parse(existingCardsJSON)
        : [];

      // Add new card to the array
      const updatedCards = [...existingCards, cardData];

      // Store the updated array back to localStorage
      localStorage.setItem("atlasCardss", JSON.stringify(updatedCards));

      console.log("Card data stored successfully!");
      console.log("Total cards:", updatedCards.length);
      console.log("Smart Account:", smartAccountAddress);
      console.log("Generated Account:", generatedAccount?.address);
      console.log("Passkey Credential ID:", passkeyCredential?.id);
      console.log("Card Name:", cardName);

      const credentials = {
        address:
          smartAccountAddress ?? ("0x000000000000000000000000" as Address),
        eoaAddress: generatedAccount.address,
        passkeyCredential: {
          id: passkeyCredential.id,
          publicKey: passkeyCredential.publicKey,
          raw: {
            authenticatorAttachment:
              passkeyCredential.raw.authenticatorAttachment,
            clientExtensionResults:
              passkeyCredential.raw.clientExtensionResults,
            id: passkeyCredential.raw.id,
            rawId: passkeyCredential.raw.rawId,
            response: {
              attestationObject:
                passkeyCredential.raw.response.attestationObject,
              authenticatorData:
                passkeyCredential.raw.response.authenticatorData,
            },
          },
        },
        webAuthnAccount: {
          publicKey: webAuthnAccount.publicKey,
          id: webAuthnAccount.id,
          type: "webAuthn",
        },
      };

      const result = await storeCredentials(cardName, credentials);
      console.log(result);

      setStep("done");
    } catch (error: any) {
      console.error(error);
      setError(error?.message || "Failed to mint card.");
    } finally {
      setIsMinting(false);
    }
  };

  const getAllCards = (): any[] => {
    if (typeof window === "undefined") return [];
    const cardsJSON = localStorage.getItem("atlasCardss");
    return cardsJSON ? JSON.parse(cardsJSON) : [];
  };

  const getCardByIndex = (index: number): any => {
    const cards = getAllCards();
    return cards[index] || null;
  };

  const getCardByAddress = (address: string): any => {
    const cards = getAllCards();
    return cards.find((card) => card.smartAccount === address) || null;
  };

  const getLatestCard = (): any => {
    const cards = getAllCards();
    return cards.length > 0 ? cards[cards.length - 1] : null;
  };

  const updateCard = (index: number, updatedData: Partial<any>): void => {
    const cards = getAllCards();
    if (index >= 0 && index < cards.length) {
      cards[index] = { ...cards[index], ...updatedData };
      localStorage.setItem("atlasCardss", JSON.stringify(cards));
    }
  };

  const deleteCard = (index: number): void => {
    const cards = getAllCards();
    if (index >= 0 && index < cards.length) {
      cards.splice(index, 1);
      localStorage.setItem("atlasCardss", JSON.stringify(cards));
    }
  };

  const clearAllCards = (): void => {
    localStorage.removeItem("atlasCardss");
  };

  const value: CardCreationContextType = {
    // State
    step,
    setStep,
    error,
    setError,
    passkeyCredential,
    setPasskeyCredential,
    smartAccount,
    setSmartAccount,
    smartAccountAddress,
    setSmartAccountAddress,
    userOperationHash,
    setUserOperationHash,
    webAuthnAccount,
    setWebAuthnAccount,
    txHash,
    setTxHash,
    passkeyName,
    setPasskeyName,
    cardName,
    setCardName,
    generatedAccount,
    setGeneratedAccount,
    message,
    setMessage,
    isDeploying,
    setIsDeploying,
    isCreatingPasskey,
    setIsCreatingPasskey,
    isAddingPasskey,
    setIsAddingPasskey,
    isMinting,
    setIsMinting,
    handleCreateAndDeploySmartAccount,
    createPasskey,
    handleAddPasskeyAsBackupSigner,
    handleMintCard,
    getAllCards,
    getCardByIndex,
    getCardByAddress,
    getLatestCard,
    updateCard,
    deleteCard,
    clearAllCards,
    getSmartAccountBalance,
  };

  return (
    <CardCreationContext.Provider value={value}>
      {children}
    </CardCreationContext.Provider>
  );
};

export const useCardCreation = () => {
  const context = useContext(CardCreationContext);
  if (context === undefined) {
    throw new Error(
      "useCardCreation must be used within a CardCreationProvider"
    );
  }
  return context;
};
