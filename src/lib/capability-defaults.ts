import { Building2, Droplets, Factory, Globe2, HardHat, Landmark, Route, ShieldCheck, TrainFront, Waves, Zap, type LucideIcon } from "lucide-react";
import capWater from "@/assets/cap-water.png.asset.json";
import capTransportation from "@/assets/cap-transportation.jpg.asset.json";
import capUrban from "@/assets/cap-urban.jpg.asset.json";
import capIrrigation from "@/assets/cap-irrigation.jpg.asset.json";
import industrial from "@/assets/industrial.asset.json";
import powerTransmission from "@/assets/power-transmission.jpg.asset.json";
import internationalInfra from "@/assets/international-infra.jpg.asset.json";

/** Icons an admin can pick for a capability card. */
export const CAPABILITY_ICONS: Record<string, { label: string; Icon: LucideIcon }> = {
  droplets: { label: "Water drop", Icon: Droplets },
  route: { label: "Road", Icon: Route },
  factory: { label: "Factory", Icon: Factory },
  shield: { label: "Shield", Icon: ShieldCheck },
  waves: { label: "Waves", Icon: Waves },
  zap: { label: "Power", Icon: Zap },
  globe: { label: "Globe", Icon: Globe2 },
  building: { label: "Building", Icon: Building2 },
  rail: { label: "Rail", Icon: TrainFront },
  landmark: { label: "Landmark", Icon: Landmark },
  hardhat: { label: "Construction", Icon: HardHat },
};
export const iconFor = (key: string) => (CAPABILITY_ICONS[key] ?? CAPABILITY_ICONS.building).Icon;

/** Built-in photos used when an admin has not uploaded a card image. */
const DEFAULT_IMAGES: Record<string, string> = {
  "water-wastewater": capWater.url,
  transportation: capTransportation.url,
  industrial: industrial.url,
  "urban-infrastructure": capUrban.url,
  "irrigation-regulators": capIrrigation.url,
  "power-transmission-distribution": powerTransmission.url,
  "international-infrastructure": internationalInfra.url,
};
export const imageFor = (slug: string, uploaded: string | null) => uploaded ?? DEFAULT_IMAGES[slug] ?? null;
