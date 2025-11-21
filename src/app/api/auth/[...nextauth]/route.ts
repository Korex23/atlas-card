import NextAuth, { AuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";

import crypto from "crypto";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "@/lib/mongo-client";
import { dbConnect } from "@/lib/mongodb";
import UserModel from "@/models/User";

import { generatePrivateKey } from "viem/accounts";
import { PaymentSDK } from "atlas-card-sdk";

const sdk = new PaymentSDK({
  pimlicoApiKey: "pim_NXnPReaRmSZSZ9BfeiEshB",
  mongoUri:
    "mongodb://mongo:ZsYglTcPTnFWleEOPPQKRwjapCNLAhSq@yamanote.proxy.rlwy.net:51825/",
  dbName: "credentials",
  collectionName: "passkeyData",
  chainId: 84532,
});

function getEncryptionKey() {
  return crypto
    .createHash("sha256")
    .update(process.env.PRIVATE_KEY_ENCRYPTION_SECRET!)
    .digest();
}

function encryptPrivateKey(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptPrivateKey(base64: string): string {
  const raw = Buffer.from(base64, "base64");
  const iv = raw.subarray(0, 16);
  const tag = raw.subarray(16, 32);
  const encrypted = raw.subarray(32);

  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
    "utf8"
  );
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    EmailProvider({
      server: {
        host: "smtp.gmail.com",
        port: 587,
        auth: { user: "ololokes@gmail.com", pass: "eagsafmqmjlpjany" },
      },
      from: "ololokes@gmail.com",
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User;
      account?: any;
    }) {
      await dbConnect();

      if (user?.email) {
        token.email = user.email;
      }

      const email = token.email as string;
      if (!email) return token;

      let existing = await UserModel.findOne({ email });

      if (!existing) {
        const privateKey = generatePrivateKey();
        const encrypted = encryptPrivateKey(privateKey);

        existing = await UserModel.create({
          email,
          encryptedPrivateKey: encrypted,
          cards: [],
        });

        token.privateKey = privateKey;
        token.userId = existing._id.toString();
        token.cards = [];
        return token;
      }

      if (!existing.encryptedPrivateKey) {
        const privateKey = generatePrivateKey();
        const encrypted = encryptPrivateKey(privateKey);

        existing.encryptedPrivateKey = encrypted;
        await existing.save();

        token.privateKey = privateKey;
        token.userId = existing._id.toString();
        token.cards = [];
        return token;
      }

      const privateKey = decryptPrivateKey(existing.encryptedPrivateKey);
      token.privateKey = privateKey;
      token.userId = existing._id.toString();

      if (Array.isArray(existing.cards) && existing.cards.length > 0) {
        const resolved = [];

        for (const entry of existing.cards) {
          try {
            const cred = await sdk.getCredentials(entry.identifier);
            console.log(cred);

            resolved.push({
              identifier: entry.identifier,
              address: cred.address,
              eoaAddress: cred.eoaAddress,
              passkeyCredential: cred.passkeyCredential,
              webAuthnAccount: cred.webAuthnAccount,
            });
          } catch (err) {
            console.error(
              `Failed to load credentials for ${entry.identifier}`,
              err
            );
          }
        }

        token.cards = resolved;
      } else {
        token.cards = [];
      }

      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & {
        privateKey?: string;
        userId?: string;
        cards?: any[];
      };
    }) {
      session.privateKey = token.privateKey;
      session.userId = token.userId;
      session.cards = token.cards ?? [];
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
