"use client";

import { WagmiProvider as WagmiProviderBase } from "wagmi";
import { PropsWithChildren } from "react";
import { config } from "@/utils/wagmi";

export function WagmiProvider(props: PropsWithChildren) {
  return (
    <WagmiProviderBase config={config}>{props.children}</WagmiProviderBase>
  );
}
