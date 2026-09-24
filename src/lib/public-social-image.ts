import socialImage from "@/app/(public)/opengraph-image.jpg";

export const publicSocialImage = {
  url: socialImage.src,
  width: socialImage.width,
  height: socialImage.height,
  alt: "NexaService workplace services portfolio preview over an illustrative commercial interior",
};

export const publicOpenGraph = {
  type: "website" as const,
  siteName: "NexaService",
  images: [publicSocialImage],
};
