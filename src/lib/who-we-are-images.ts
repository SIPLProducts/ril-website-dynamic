import main from "@/assets/who-we-are-main.jpg.asset.json";
import support1 from "@/assets/who-we-are-support-1.jpg.asset.json";
import support2 from "@/assets/who-we-are-support-2.jpg.asset.json";

// Each slot is replaceable independently (future admin panel); layout/cropping stays the same.
export type WhoWeAreImage = { slot: string; url: string; alt: string; position: string };

export const WHO_WE_ARE_IMAGES: { main: WhoWeAreImage; supporting: WhoWeAreImage[] } = {
  main: {
    slot: "Who We Are — Hero Main Image",
    url: main.url,
    alt: "Aerial view of a highway curving through dense forest",
    position: "50% 55%",
  },
  supporting: [
    {
      slot: "Who We Are — Supporting Image 1",
      url: support1.url,
      alt: "Aerial view of the Nagole sewage treatment plant",
      position: "60% 50%",
    },
    {
      slot: "Who We Are — Supporting Image 2",
      url: support2.url,
      alt: "Aerial view of a residential housing project",
      position: "50% 40%",
    },
  ],
};
