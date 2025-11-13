import {
  createBundlerClient,
  createPaymasterClient,
} from "viem/account-abstraction";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { createPublicClient, http } from "viem";
import { baseSepolia as chain } from "viem/chains";

export const publicClient = createPublicClient({
  chain,
  transport: http(chain.rpcUrls.default.http[0]),
});

export const paymasterClient = createPaymasterClient({
  transport: http(
    "https://api.pimlico.io/v2/84532/rpc?apikey=pim_NXnPReaRmSZSZ9BfeiEshB"
  ),
});

export const bundlerClient = createBundlerClient({
  client: publicClient,
  paymaster: paymasterClient,
  transport: http(
    "https://api.pimlico.io/v2/84532/rpc?apikey=pim_NXnPReaRmSZSZ9BfeiEshB"
  ),
});

export const pimlicoClient = createPimlicoClient({
  transport: http(
    "https://api.pimlico.io/v2/84532/rpc?apikey=pim_NXnPReaRmSZSZ9BfeiEshB"
  ),
});
