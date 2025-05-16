import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { http, createConfig } from "wagmi";
import { base, baseSepolia, Chain } from "wagmi/chains";
import { TEST_MODE } from "./config";

const chain: Chain = TEST_MODE ? baseSepolia : base;

export const config = createConfig({
  chains: [chain],
  transports: {
    [chain.id]: http(),
  },
  connectors: [farcasterFrame()],
});
