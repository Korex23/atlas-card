import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"];
    privateKey: string;
    userId: string;
    cards: {
      identifier: string;
      address: string;
      eoaAddress: string;
      passkeyCredential: any;
      webAuthnAccount: any;
    }[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    privateKey: string;
    userId: string;
    cards: {
      identifier: string;
      address: string;
      eoaAddress: string;
      passkeyCredential: any;
      webAuthnAccount: any;
    }[];
  }
}
