import { PropsWithChildren } from "react";
import { Viewport } from "next";
import { Layout } from "@/components/layout";
import { Providers } from "@/context";
import "@/assets/globals.css";

export const viewport: Viewport = {
  width: "device-width",
  height: "device-height",
  initialScale: 1.0,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout(props: PropsWithChildren) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <Providers>
          <Layout>{props.children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
