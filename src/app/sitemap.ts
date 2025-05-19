import { APP_URL } from "@/utils/config";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
  ];
}
