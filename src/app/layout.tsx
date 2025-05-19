import { PropsWithChildren } from "react";
import { Metadata, Viewport } from "next";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  SOCIAL_TWITTER,
} from "@/utils/config";
import { Layout } from "@/components/layout";
import { Providers } from "@/context";
import "@/assets/globals.css";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

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
