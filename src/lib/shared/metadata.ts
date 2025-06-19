import { Metadata } from "next";
import { ensureStartsWith } from "../utils";

const { TWITTER_CREATOR, TWITTER_SITE } = process.env;
const twitterCreator = TWITTER_CREATOR
  ? ensureStartsWith(TWITTER_CREATOR, "@")
  : undefined;
const twitterSite = TWITTER_SITE
  ? ensureStartsWith(TWITTER_SITE, "https://")
  : undefined;
  
export function constructMetadata({
  title = "Nation-Huawei Leap Job Fair 2025",
  description = "A bold partnership between Nation Media Group and Huawei Technologies to bridge talent in Kenya with businesses that need it. Join us June 26-27, 2025 at UON Graduation Square, Nairobi for innovative booths, engaging panel discussions, and meaningful career connections.",
  image = "https://res.cloudinary.com/db0i0umxn/image/upload/v1747817579/Screenshot_2025-05-2115227_vxo86w.png",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    ...(twitterCreator &&
      twitterSite && {
        twitter: {
          card: "summary_large_image",
          creator: twitterCreator,
          site: twitterSite,
        },
      }),
    icons,
    metadataBase: new URL("https://buzzvar.com/"),
    ...(noIndex && {
      robots: {
        index: true,
        follow: true,
      },
    }),
  };
}
