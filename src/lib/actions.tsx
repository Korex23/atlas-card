"use server";
import { PaymentSDK, Credentials } from "atlas-card-sdk";
import { Address, Chain, getAddress } from "viem";
import { dbConnect } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { baseSepolia } from "viem/chains";

const sdk = new PaymentSDK({
  pimlicoApiKey: "pim_NXnPReaRmSZSZ9BfeiEshB",
  mongoUri:
    "mongodb://mongo:ZsYglTcPTnFWleEOPPQKRwjapCNLAhSq@yamanote.proxy.rlwy.net:51825/",
  dbName: "credentials",
  collectionName: "passkeyData",
  chainId: 84532,
  chain: baseSepolia as Chain,
});

type SerializablePasskeyResponse = {
  attestationObject: string;
  authenticatorData: string;
};

type SerializableRawPasskeyData = {
  authenticatorAttachment: "platform" | "cross-platform" | string;
  clientExtensionResults: Record<string, any>;
  id: string;
  rawId: string;
  response: SerializablePasskeyResponse;
};

interface SerializablePasskeyCredential {
  id: string;
  publicKey: string;
  raw: SerializableRawPasskeyData;
}
interface SerializableWebAuthnAccount {
  publicKey: string;
  id: string;
  type: string;
}

interface SerializableCredentials {
  address: Address;
  eoaAddress: Address;
  passkeyCredential: SerializablePasskeyCredential;
  webAuthnAccount: SerializableWebAuthnAccount;
}

export async function connect() {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");
    await sdk.connect();
    console.log("✅ MongoDB connected successfully");
    return { success: true, message: "Connected to MongoDB" };
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error);
    // disconnect();
    return {
      success: false,
      error: {
        message: error.message || "Failed to connect",
        name: error.name,
        details: error.details || error.toString(),
      },
    };
  }
}

export async function storeCredentials(
  identifier: string,
  data: SerializableCredentials
) {
  try {
    console.log("💾 Storing credentials for:", identifier);

    if (!data.address || !data.passkeyCredential || !data.webAuthnAccount) {
      throw new Error("Missing required credential fields");
    }

    const result = await sdk.storeCredentials(identifier, data);
    console.log("✅ Credentials stored successfully in SDK:", result);

    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      throw new Error("No signed-in user found");
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      throw new Error("User not found in database");
    }

    console.log(user);

    const card = {
      identifier,
    };

    user.cards = user.cards || [];
    user.cards.push(card);

    await user.save();
    console.log("✅ Credentials saved to User DB successfully");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("❌ Failed to store credentials:", error);
    return {
      success: false,
      error: {
        message: error.message || "Failed to store credentials",
        name: error.name,
        details: error.details || error.toString(),
      },
    };
  }
}

export async function getPaymentAddress(identifier: string) {
  try {
    console.log("💳 Getting payment address for:", identifier);

    const result = await sdk.getMerchantPaymentAddress(identifier);
    console.log("✅ Payment address retrieved:", result.paymentAddress);

    return { success: true, data: result };
  } catch (error: any) {
    console.error("❌ Failed to get payment address:", error);

    return {
      success: false,
      error: {
        message: error.message || "Failed to get payment address",
        name: error.name,
        details: error.details || error.toString(),
      },
    };
  }
}

export async function constructTransaction(
  customerIdentifier: string,
  merchantPaymentAddress: Address,
  amount: string,
  options?: { token?: string; memo?: string }
) {
  try {
    console.log("🔨 Constructing transaction:", {
      customerIdentifier,
      merchantPaymentAddress,
      amount,
      options,
    });

    const tx = await sdk.constructPaymentTransaction(
      customerIdentifier,
      merchantPaymentAddress,
      amount,
      options || {}
    );

    console.log("✅ Transaction constructed successfully");

    return {
      success: true,
      data: {
        details: tx.details,
        call: {
          to: getAddress(tx.call.to),
          value: tx.call.value.toString(),
          data: tx.call.data,
        },
        fee: tx.fee,
      },
    };
  } catch (error: any) {
    console.error("❌ Failed to construct transaction:", error);

    return {
      success: false,
      error: {
        message: error.message || "Failed to construct transaction",
        name: error.name,
        details: error.details || error.toString(),
      },
    };
  }
}

export async function getBalance(address: Address, token: string = "ETH") {
  try {
    console.log("📊 Getting balance for:", { address, token });

    const balance = await sdk.getBalance(address, token as any);
    console.log("✅ Balance retrieved:", balance);

    return { success: true, data: { balance, token } };
  } catch (error: any) {
    console.error("❌ Failed to get balance:", error);

    return {
      success: false,
      error: {
        message: error.message || "Failed to get balance",
        name: error.name,
        details: error.details || error.toString(),
      },
    };
  }
}

export async function recoverDelegation(
  delegation: string,
  privateKey: string,
  amount: string
): Promise<`0x${string}` | null> {
  try {
    const cleanDelegation = delegation.trim();

    if (!cleanDelegation) {
      throw new Error("Delegation string is empty");
    }

    // Log for debugging
    console.log("Delegation length:", cleanDelegation.length);
    console.log(
      "Delegation preview:",
      cleanDelegation.substring(0, 50) + "..."
    );

    const tx = await sdk.redeemDelegation(
      cleanDelegation,
      privateKey,
      "USDC",
      amount
    );
    return tx.hash;
  } catch (error: any) {
    console.error("Failed to recover delegation:", error.message || error);
    console.error("Error stack:", error.stack);
    return null;
  }
}

export async function disconnect() {
  try {
    console.log("🔌 Disconnecting from MongoDB...");
    await sdk.disconnect();
    console.log("✅ Disconnected successfully");
    return { success: true, message: "Disconnected from MongoDB" };
  } catch (error: any) {
    console.error("❌ Failed to disconnect:", error);
    return {
      success: false,
      error: {
        message: error.message || "Failed to disconnect",
        name: error.name,
        details: error.details || error.toString(),
      },
    };
  }
}
