import { PropsWithChildren } from "react";
import { QueryProvider } from "./query";
import { FarcasterProvider } from "./farcaster";
import { WagmiProvider } from "./wagmi";

export function Providers(props: PropsWithChildren) {
  return (
    <WagmiProvider>
      <QueryProvider>
        <FarcasterProvider>{props.children}</FarcasterProvider>
      </QueryProvider>
    </WagmiProvider>
  );
}
