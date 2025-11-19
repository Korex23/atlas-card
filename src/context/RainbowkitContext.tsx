"use client";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import * as wagmiChains from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { ReactNode } from "react";

const supportedChains = [wagmiChains.baseSepolia] as const;

const config = getDefaultConfig({
  appName: "Deserialize Bridge",
  projectId: "b0fe077e0685d22f99449b094c2b8ce2",
  chains: supportedChains,
  ssr: true,
});
const queryClient = new QueryClient();

const RainbowKitContext: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};
export default RainbowKitContext;
