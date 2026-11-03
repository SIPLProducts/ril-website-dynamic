import { useQuery } from "@tanstack/react-query";
import { csrQuery, mediaQuery } from "@/lib/site-content.functions";
import { managementQuery } from "@/lib/management.functions";
import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BUSINESS_VERTICALS } from "@/lib/business-projects";
import { ArrowRight, Droplets, ExternalLink, Factory, Globe2, Leaf, Pause, Play, Route, ShieldCheck, Waves, Zap } from "lucide-react";
import irrigationRegulatorsAsset from "@/assets/irrigation-regulators.jpg.asset.json";
import powerTransmissionAsset from "@/assets/power-transmission.jpg.asset.json";
import internationalInfraAsset from "@/assets/international-infra.jpg.asset.json";
import hero from "@/assets/hero.asset.json";
import water from "@/assets/water.asset.json";
import bridge from "@/assets/bridge.asset.json";
import hummingbird from "@/assets/sustainability-hummingbird.mp4.asset.json";
import hummingbirdPoster from "@/assets/sustainability-hummingbird-poster.jpg.asset.json";
import urban from "@/assets/urban.asset.json";
import irrigation from "@/assets/irrigation.asset.json";
import industrial from "@/assets/industrial.asset.json";
import slide3Asset from "@/assets/slide-3.jpg.asset.json";
import leachateHyd from "@/assets/leachate-hyderabad.asset.json";
import wtpNalgonda from "@/assets/wtp-nalgonda.jpg.asset.json";
import srinagarBanihal from "@/assets/srinagar-banihal-expressway.jpg.asset.json";
import { WHO_WE_ARE_IMAGES } from "@/lib/who-we-are-images";
import namBridge from "@/assets/nam-bridge.jpg.asset.json";
import lm1 from "@/assets/landmark-1.jpg.asset.json";
import lm2 from "@/assets/landmark-2.jpg.asset.json";
import lm3 from "@/assets/landmark-3.jpg.asset.json";
import lm4 from "@/assets/landmark-4.jpg.asset.json";
import lm7 from "@/assets/landmark-7.jpg.asset.json";
import namExpresswayCombinedAsset from "@/assets/nam-expressway-combined.jpg.asset.json";
import musiCombined from "@/assets/musi-two-photos.jpg.asset.json";
import odysseyCombined from "@/assets/odyssey-combined.jpg.asset.json";
import narelaCombined from "@/assets/narela-bawana-combined.jpg.asset.json";
import capWater from "@/assets/cap-water.png.asset.json";
import capTransportation from "@/assets/cap-transportation.jpg.asset.json";
import capUrban from "@/assets/cap-urban.jpg.asset.json";
import capIrrigation from "@/assets/cap-irrigation.jpg.asset.json";
const irrigationRegulators = irrigationRegulatorsAsset.url;
const powerTransmission = powerTransmissionAsset.url;
const internationalInfra = internationalInfraAsset.url;
const slide3 = slide3Asset.url;
const namExpresswayCombined = namExpresswayCombinedAsset.url;

const HERO_SLIDES = [
  {
    src: leachateHyd.url,
    alt: "Aerial view of the Leachate Treatment and Disposal Project, Hyderabad",
    project: "Leachate Treatment and Disposal Project, Hyderabad",
    headline: "Building the infrastructure that carries a nation forward.",
    sub: "Leachate Treatment and Disposal Project, Hyderabad — safeguarding the city's environment through advanced waste management, delivered responsibly, at scale.",
  },
  {
    src: srinagarBanihal.url,
    alt: "Srinagar–Banihal Expressway, NH-1A, Jammu & Kashmir — snow-lined expressway with toll plaza",
    project: "Srinagar–Banihal Expressway, NH-1A, Jammu & Kashmir",
    headline: "Engineering Infrastructure. Enabling Progress.",
    sub: "Srinagar–Banihal Expressway, NH-1A, Jammu & Kashmir — dependable all-weather connectivity across the Himalayas, built to national highway standards.",
  },
  {
    src: wtpNalgonda.url,
    alt: "Aerial view of the 410 MLD Water Treatment Plant, Nalgonda",
    project: "410 MLD Water Treatment Plant, Nalgonda",
    headline: "Engineering the foundations of progress.",
    sub: "410 MLD Water Treatment Plant, Nalgonda — delivering safe, reliable drinking water at scale for communities across the region.",
  },
  {
    src: slide3,
    alt: "Concrete dam and irrigation headworks with open gates",
    project: "Lift Irrigation Schemes, Barrages and Reservoirs",
    headline: "Engineering Infrastructure. Enabling Progress.",
    sub: "Lift irrigation schemes, barrages and reservoirs carrying water to farmland and industry.",
  },
  {
    src: namBridge.url,
    alt: "Aerial view of a road bridge spanning a wide river",
    project: "NAM Expressway Bridge",
    headline: "Engineering the foundations of progress.",
    sub: "Landmark bridge structures built to serve generations — safe, durable and beautifully engineered.",
  },
];

export function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeSlide = HERO_SLIDES[active] ?? HERO_SLIDES[0]!;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPaused(true);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused]);

  const textShadow = "[text-shadow:0_1px_14px_oklch(0.18_0.03_252/0.6)]";

  return (
    <section id="top" className="relative isolate min-h-[92vh] overflow-hidden bg-ink">
      {HERO_SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          width={1920}
          height={1080}
          loading={i === 0 ? undefined : "lazy"}
          aria-hidden={i !== active}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/70 via-ink/30 to-transparent lg:h-1/2 lg:from-ink/45 lg:via-ink/15" />
      <div className={`relative mx-auto flex min-h-[92vh] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-40 lg:px-10 lg:pb-24 ${textShadow}`}>
        <p className="eyebrow">Ramky Infrastructure Limited</p>
        <div key={active}>
          <p className="hero-text-in mt-5 max-w-2xl font-display text-xs font-semibold uppercase text-ink-foreground/90">
            <span className="text-brand-orange">Project:</span> {activeSlide.project}
          </p>
          <h1 className="hero-text-in mt-4 max-w-4xl text-4xl font-bold leading-[1.05] text-ink-foreground sm:text-6xl lg:text-7xl">
            {activeSlide.headline}
          </h1>
          <p
            className="hero-text-in mt-6 max-w-2xl text-base leading-relaxed text-ink-foreground/90 sm:text-lg"
            style={{ animationDelay: "0.15s" }}
          >
            {activeSlide.sub}
          </p>
        </div>
        <div className="-ml-1.5 mt-7 flex flex-wrap items-center gap-0.5">
          {HERO_SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === active}
              onClick={() => setActive(i)}
              className="group/dot flex h-11 items-center px-1.5"
            >
              <span
                className={`block h-1 rounded-full transition-all duration-500 ${
                  i === active ? "w-10 bg-brand-orange" : "w-5 bg-ink-foreground/45 group-hover/dot:bg-ink-foreground/70"
                }`}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play slideshow" : "Pause slideshow"}
            aria-pressed={paused}
            className="ml-2 inline-flex size-9 items-center justify-center rounded-full border border-ink-foreground/40 text-ink-foreground/90 transition-colors hover:border-brand-orange hover:text-brand-orange"
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
          </button>
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { value: "30+", label: "Years of Experience" },
  { value: "500+", label: "Projects executed across sectors" },
  { value: "1,000+", label: "Employees" },
  { value: "PAN India", label: "Presence" },
  { value: "₹13,000 Cr", label: "Order Book" },
];

export function StatsBand() {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-[1280px] flex-wrap justify-center gap-x-8 gap-y-10 px-5 py-12 sm:px-8 lg:px-10">
        {STATS.map((s) => (
          <div key={s.label} className="rule-accent w-full pt-6 sm:w-[calc(50%-1rem)] md:w-[calc(33.333%-1.333rem)] lg:w-[calc(20%-1.6rem)]">
            <p className="font-display text-4xl font-bold text-brand-blue lg:text-[1.75rem] xl:text-4xl">{s.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const ABOUT_PARAGRAPHS = [
  "Ramky Infrastructure Limited (Ramky Infra) is a flagship company of Ramky Group, one of the emerging leaders in the field of infrastructure development & environment management. Since the incorporation of its business in 1994, the Company has proudly completed a wide range of construction and infrastructure projects in various sectors such as water and wastewater, transportation (including terminals), irrigation, industrial construction (including SEZs & industrial parks), power transmission and distribution, buildings (including residential, commercial & retail property).",
  "With a highly skilled team of over 2000 people, headquartered in Hyderabad, Telangana, the Company manages its business operations in India and internationally. The pan-India presence has enabled the company to serve the growing infrastructure needs across the country. Ramky Infrastructure Ltd is a customer centric, environment concerned and development oriented company.",
  "Ramky Infra operates mainly in three principal business segments — the Construction Business & international business is operated directly by the Company and the Developer business is operated through its subsidiaries & associates.",
  "Employing the public-private partnership model, Ramky has successfully utilized its core strengths and competencies to fulfill the cutting edge client requirements. The International Business is operated by the Ramky Infrastructure which takes up activities of overseas business explorations in areas such as infrastructure development, roads, and water & waste water.",
  "Ramky Infra is ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 certified for Quality Management Systems, Environment Management System and Occupational Health & Safety Management Systems which the Company applies to the design, development, engineering, procurement and construction of projects.",
];

export function About() {
  const [expanded, setExpanded] = useState(false);
  return (
    <section id="about" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <p className="eyebrow">Who we are</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            An integrated developer of essential public infrastructure.
          </h2>
          <div className="mt-6 text-base leading-relaxed text-muted-foreground">
            <p>{ABOUT_PARAGRAPHS[0]}</p>
            {expanded && (
              <div className="mt-4 space-y-4">
                {ABOUT_PARAGRAPHS.slice(1).map((text) => (
                  <p key={text.slice(0, 24)}>{text}</p>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-7 inline-flex items-center gap-2 rounded-sm bg-brand-orange px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.1em] text-accent-foreground transition-opacity hover:opacity-90"
          >
            {expanded ? "Read less" : "Read more"}
            <ArrowRight className={`size-4 transition-transform ${expanded ? "-rotate-90" : "rotate-90"}`} />
          </button>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, t: "Safety first", d: "Zero-harm site culture" },
              { icon: Leaf, t: "Sustainable", d: "Low-impact delivery" },
              { icon: Waves, t: "Integrated", d: "Concept to O&M" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="border-l-2 border-brand-green pl-4">
                <Icon className="size-5 text-brand-green" />
                <p className="mt-2 font-display text-sm font-semibold">{t}</p>
                <p className="text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[WHO_WE_ARE_IMAGES.main, ...WHO_WE_ARE_IMAGES.supporting].map((img, i) => (
            <figure
              key={img.slot}
              data-slot={img.slot}
              className={`group relative overflow-hidden rounded-sm bg-surface ${
                i === 0 ? "col-span-2 aspect-[16/9] lg:aspect-[16/8.5]" : "aspect-[4/3]"
              }`}
            >
              <img
                src={img.url}
                alt={img.alt}
                width={i === 0 ? 1920 : 1200}
                height={i === 0 ? 1080 : 900}
                loading="lazy"
                decoding="async"
                sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                style={{ objectPosition: img.position }}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              />
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/10" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const BUSINESSES = [
  {
    icon: Droplets,
    title: "Water & Wastewater",
    text: "Water treatment and supply, sewerage networks, STPs and desalination for cities and industry.",
    img: capWater,
    alt: "Wastewater treatment plant clarifier tanks",
  },
  {
    icon: Route,
    title: "Transportation",
    text: "Expressways, highways, urban roads, flyovers and major bridge structures under EPC and HAM.",
    img: capTransportation,
    alt: "Long cable-stayed bridge at dusk",
  },
  {
    icon: Factory,
    title: "Industrial",
    text: "Industrial parks, heavy civil works, structural steel and plant infrastructure.",
    img: industrial,
    alt: "Steel framework of an industrial building under construction",
  },
  {
    icon: ShieldCheck,
    title: "Urban Infrastructure",
    text: "Townships, institutional buildings, smart-city works and public realm development.",
    img: capUrban,
    alt: "Aerial view of a modern township",
  },
  {
    icon: Waves,
    title: "Irrigation & Regulators",
    text: "Canals, barrages, regulators and large-scale water control structures.",
    img: capIrrigation,
    alt: "Aerial view of a river barrage with regulator gates",
  },
  {
    icon: Zap,
    title: "Power Transmission & Distribution",
    text: "High-voltage transmission corridors, substations and distribution networks.",
    img: { url: powerTransmission },
    alt: "High-voltage transmission towers beside an electrical substation",
  },
  {
    icon: Globe2,
    title: "International Infrastructure",
    text: "Roads, water and civil infrastructure delivered for clients overseas.",
    img: { url: internationalInfra },
    alt: "Large international interchange and bridge under construction",
  },
];

export function Businesses() {
  return (
    <section id="businesses" className="bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="max-w-3xl">
          <p className="eyebrow">Capabilities</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Multi-Disciplinary Spectrum
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">Engineering capabilities across essential civil sectors.</p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {BUSINESSES.map(({ icon: Icon, title, text, img, alt }) => {
            const v = BUSINESS_VERTICALS.find((b) => b.title === title)!;
            return (
            <Link key={title} to="/businesses/$slug" params={{ slug: v.slug }} className="card-lift group flex flex-col overflow-hidden rounded-sm bg-card">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={img.url}
                  alt={alt}
                  width={1200}
                  height={900}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <Icon className="absolute bottom-4 left-4 size-7 text-ink-foreground" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
                <span className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-blue">
                  Explore <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const LANDMARK_PROJECTS = [
  {
    name: "Srinagar to Banihal Section (NH-44)",
    detail: "Rehabilitation, Strengthening and Four-Lanning of Srinagar to Banihal Section (NH-44).",
    img: lm1,
  },
  {
    name: "Jawahar Nagar Leachate Treatment Facility",
    detail:
      "A specialized waste-management plant located at the Jawahar Nagar municipal solid waste dump yard in Hyderabad, Telangana — a 2 MLD capacity system that utilizes advanced Mechanical Vapor Recompression (MVR) technology.",
    img: lm2,
  },
  {
    name: "410 MLD Water Treatment Plant, Kodandapur",
    detail:
      "A massive infrastructure asset located in the Nalgonda district of Telangana. This plant plays into the state's broader water initiatives like Mission Bhagiratha.",
    img: lm3,
  },
  {
    name: "Jawaharlal Nehru Pharma City (JNPC)",
    detail:
      "Located at Parawada near Visakhapatnam (Vizag), Andhra Pradesh. Spanning over 2,400 acres, JNPC is a highly specialized industrial park designed explicitly for the pharmaceutical sector.",
    img: lm4,
  },
  {
    name: "NAM Expressway",
    detail:
      "The NAM Expressway (Narketpally–Addanki–Medarametla Road) is a prominent 212.5-kilometer, four-lane highway that serves as a vital interstate corridor between Telangana and Andhra Pradesh.",
    img: { url: namExpresswayCombined },
  },
  {
    name: "Indian Institute of Foreign Trade (IIFT), Kolkata",
    detail:
      "An autonomous, premier public business school located in Madurdaha, West Bengal.",
    img: lm7,
  },
  {
    name: "Musi River Rejuvenation Project",
    detail:
      "Development of five decentralised sewage treatment plants along the Musi River to treat wastewater and reduce untreated sewage discharge, 480 MLD Total Treatment Capacity",
    img: musiCombined,
  },
  {
    name: "Ramky One Odyssey",
    detail:
      "Ramky One Odyssey, is a premium residential gated community located at Kokapet–Narsingi, Hyderabad. Spread across approximately 5.3 acres, the project comprises three high-rise residential towers of 3B + Ground/Stilt + 36 floors, housing around 783 units.The project has received an IGBC Gold rating and benefits from strategic connectivity to the Financial District, Gachibowli and other key commercial hubs via the ORR.",
    img: odysseyCombined,
  },
  {
    name: "Narela-Bawana waste-to-energy plant",
    detail:
      "largest waste-to-energy plant, with a capacity of 24 MW energy-generation facility spread over 100 acres",
    img: narelaCombined,
  },
];

export function Projects() {
  const [index, setIndex] = useState(0);
  const total = LANDMARK_PROJECTS.length;
  const go = (n: number) => setIndex((n + total) % total);

  useEffect(() => {
    const t = setTimeout(() => setIndex((i) => (i + 1) % total), 6000);
    return () => clearTimeout(t);
  }, [index, total]);

  const current = LANDMARK_PROJECTS[index]!;

  return (
    <section id="projects" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
      <div className="max-w-2xl">
        <p className="eyebrow">Projects that shape places</p>
        <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Landmark Engineering</h2>
      </div>
      <div className="mt-12 overflow-hidden rounded-sm bg-ink">
        <div className={`group relative w-full ${current.img.url === narelaCombined.url ? "aspect-[1923/658] md:aspect-[16/9] lg:aspect-[21/9]" : current.img.url === musiCombined.url ? "aspect-[2221/720] md:aspect-[16/9] lg:aspect-[21/9]" : "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"}`}>
          {LANDMARK_PROJECTS.map((p, i) => (
            <img
              key={p.img.url}
              src={p.img.url}
              alt={p.name}
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 size-full ${[namExpresswayCombined, musiCombined.url, odysseyCombined.url, narelaCombined.url].includes(p.img.url) ? "object-contain object-top" : "object-cover"} transition-all duration-1000 group-hover:scale-[1.02] ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
          <div className="absolute inset-x-0 bottom-0 hidden h-3/5 bg-gradient-to-t from-ink/80 via-ink/35 to-transparent md:block" />
          <div key={index} className="absolute inset-x-0 bottom-0 hidden max-w-3xl p-10 md:block md:pr-40 lg:pr-10">
            <h3 className="text-3xl font-semibold text-ink-foreground">{current.name}</h3>
            <p className="mt-3 text-base leading-relaxed text-ink-foreground/80">{current.detail}</p>
          </div>
          <div className="absolute right-4 top-4 flex gap-2 md:bottom-10 md:right-10 md:top-auto">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous project"
              className="inline-flex size-11 items-center justify-center rounded-sm bg-background/90 text-foreground transition-colors hover:bg-brand-orange hover:text-accent-foreground"
            >
              <ArrowRight className="size-4 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next project"
              className="inline-flex size-11 items-center justify-center rounded-sm bg-background/90 text-foreground transition-colors hover:bg-brand-orange hover:text-accent-foreground"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
        <div className="bg-surface p-5 md:hidden">
          <h3 className="text-xl font-semibold">{current.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{current.detail}</p>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap justify-center gap-1">
        {LANDMARK_PROJECTS.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show ${p.name}`}
            className="flex h-8 min-w-11 items-center justify-center px-1"
          >
            <span className={`block h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-brand-orange" : "w-4 bg-border"}`} />
          </button>
        ))}
      </div>
    </section>
  );
}

const sustainabilityStats = [
  {
    v: "22% Reduction",
    l: "Energy Consumption",
    d: "Reduction in energy consumption compared with FY 2024–25.",
  },
  {
    v: "32% Reduction",
    l: "Scope 1 & 2 GHG Emissions",
    d: "Reduction in Scope 1 and Scope 2 greenhouse gas emissions compared with FY 2024–25.",
  },
  {
    v: "1,695 MT",
    l: "Waste Recycled",
    d: "98% of total waste generated recycled in FY 2025–26.",
  },
  {
    v: "45,000+",
    l: "Lives Impacted Through CSR",
    d: "People positively impacted through CSR initiatives in FY 2025–26.",
  },
  {
    v: "Zero",
    l: "Workplace Fatalities",
    d: "Zero workplace fatalities recorded in FY 2025–26.",
  },
  {
    v: "Zero",
    l: "POSH Complaints",
    d: "Zero POSH complaints reported in FY 2025–26.",
  },
];

export function Sustainability() {
  return (
    <section id="sustainability" className="sustainability-panel">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-10 lg:py-28">
        <div>
          <p className="eyebrow">Sustainability</p>
          <h2 className="mt-4 text-[1.2rem] font-bold leading-tight text-sustainability-foreground sm:text-[1.9rem] xl:text-[2.5rem]">
            Towards sustainable growth — not as a slogan, as a method.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-sustainability-muted">
            Environmental stewardship is embedded in how we plan sites, manage material, treat water
            and hand assets over. We measure what we consume, reduce what we can, and design for
            the operating life ahead.
          </p>
          <div className="mt-9 grid max-w-xl grid-cols-2 gap-6 sm:gap-10">
            {[
              { v: "1.8 M m³", l: "Water treated per day" },
              { v: "ISO 14001", l: "Certified systems" },
            ].map((i) => (
              <div key={i.l} className="brand-rule pt-4">
                <p className="font-display text-2xl font-bold text-sustainability-foreground">{i.v}</p>
                <p className="mt-1 text-sm text-sustainability-muted">{i.l}</p>
              </div>
            ))}
          </div>
        </div>
        <SustainabilityVideo />
      </div>
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-8">
          {sustainabilityStats.map((s) => (
            <div key={s.l} className="brand-rule pt-4">
              <p className="font-display text-xl font-bold text-sustainability-foreground sm:text-2xl">
                {s.v}
              </p>
              <p className="mt-1 text-sm text-sustainability-muted">{s.l}</p>
              <p className="mt-2 text-xs leading-relaxed text-sustainability-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SustainabilityVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      v.pause();
    } else {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, []);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-sm bg-sustainability-deep lg:aspect-auto lg:h-[30rem]">
      <video
        ref={ref}
        src={hummingbird.url}
        poster={hummingbirdPoster.url}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Hummingbird feeding on nectar among flowers"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}

export function InvestorsCareers() {
  const mediaPage = useQuery(mediaQuery()).data?.page;
  const cards = [
    { id: "careers", eyebrow: "People & Careers", title: "Build a career that stands up", text: "Engineers, planners, safety professionals and site leaders — join teams delivering infrastructure that millions of people use every day.", to: "/careers", cta: "Explore" },
  ];
  return (
    <section className="bg-surface py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1400px] items-stretch gap-6 px-5 lg:grid-cols-3 lg:px-10">
        {cards.map((c) => (
          <div key={c.id} id={c.id} className="card-lift flex h-full scroll-mt-24 flex-col rounded-sm border border-border bg-card p-8">
            <p className="eyebrow">{c.eyebrow}</p>
            <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{c.title}</h3>
            <p className="mb-6 mt-3 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            <a href={c.to} className="mt-auto inline-flex self-start items-center gap-2 rounded-sm bg-brand-orange px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
              {c.cta} <ArrowRight className="size-4" />
            </a>
          </div>
        ))}
        <CsrCard />
        <div id="media" className="card-lift flex h-full scroll-mt-24 flex-col rounded-sm border border-border bg-card p-8">
          <p className="eyebrow">Media</p>
          <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{mediaPage?.cardTitle ?? "Media"}</h3>
          <p className="mt-1 font-display text-sm font-semibold text-brand-blue">{mediaPage?.cardSubtitle}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{mediaPage?.cardText}</p>
          <div className="h-6" />
          <Link to="/media" className="mt-auto inline-flex self-start items-center gap-2 rounded-sm bg-brand-orange px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground">
            Media Centre <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function CsrCard() {
  const { data: csr } = useQuery(csrQuery());
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const reveal = () => {
      if (window.location.hash !== "#csr") return;
      setOpen(true);
      document.getElementById("csr")?.scrollIntoView({ block: "start" });
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    window.addEventListener("ramky:open-csr", reveal);
    return () => {
      window.removeEventListener("hashchange", reveal);
      window.removeEventListener("ramky:open-csr", reveal);
    };
  }, []);
  return (
    <div id="csr" className="card-lift flex h-full scroll-mt-24 flex-col rounded-sm border border-border bg-card p-8">
      <p className="eyebrow inline-flex items-center gap-2"><Leaf className="size-3.5 text-brand-green" /> {csr?.eyebrow ?? "CSR"}</p>
      <h3 className="mt-3 text-2xl font-semibold sm:text-3xl">{csr?.title ?? "Community Stewardship"}</h3>
      <p className="mt-1 font-display text-sm font-semibold text-brand-green">{csr?.subtitle}</p>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{csr?.intro}</p>
      {open && (
        <div id="csr-details" className="mt-5 space-y-4 border-l-2 border-brand-green pl-4">
          {(csr?.areas ?? []).map((a) => (
            <div key={a.id}>
              <h4 className="text-sm font-semibold">{a.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{a.text}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="csr-details"
          className="inline-flex items-center gap-2 rounded-sm border border-border px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.12em]"
        >
          {open ? "Show less" : "Read more"}
        </button>
        {open && csr?.ctaUrl && (
          <a
            href={csr.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-brand-orange px-5 py-3 font-display text-xs font-semibold uppercase tracking-[0.12em] text-accent-foreground"
          >
            {csr.ctaLabel || "Learn more"} <ExternalLink className="size-4" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>
    </div>
  );
}

const JOURNEY_MILESTONES = [
  { year: "1994", title: "Founded", text: "Ramky begins as a civil contracting firm in Hyderabad." },
  { year: "2000", title: "Environment entry", text: "Pioneering integrated waste management facilities in India." },
  { year: "2005", title: "National scale", text: "Water, irrigation and highway EPC contracts across multiple states." },
  { year: "2010", title: "Public listing", text: "Ramky Infrastructure Limited lists on NSE and BSE." },
  { year: "2016", title: "Overseas delivery", text: "Projects executed in the Middle East and Africa." },
  { year: "2024", title: "Next decade", text: "HAM highways, smart-city works and large lift irrigation schemes." },
];

export function Journey() {
  return (
    <section id="journey" className="scroll-mt-24 bg-surface py-20 lg:py-28">
      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        <div className="max-w-3xl">
          <p className="eyebrow">Our Journey</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            Three decades of building, milestone by milestone.
          </h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {JOURNEY_MILESTONES.map((milestone) => (
            <article key={milestone.year} className="border border-border bg-card p-7 shadow-sm">
              <p className="font-display text-3xl font-bold text-brand-orange">{milestone.year}</p>
              <div className="mt-3 h-px w-14 bg-brand-green" />
              <h3 className="mt-5 font-display text-lg font-semibold">{milestone.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{milestone.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const SENIOR_CARD = { name: "Senior Management Team", role: "Executive Leadership", bio: "Experienced leaders responsible for operations, finance, project controls, safety and quality across the organisation." };

const linkCls = "group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2";

function GroupHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden="true" className="h-6 w-1 bg-brand-orange" />
      <h3 className="font-display text-xl font-semibold text-brand-blue sm:text-2xl">{title}</h3>
    </div>
  );
}

function CardBody({ name, role, bio }: { name: string; role: string; bio?: string }) {
  return (
    <article className="flex h-full min-h-[8rem] flex-col justify-center border border-border bg-card px-5 py-4 transition-shadow duration-300 group-hover:shadow-lg">
      <h4 className="font-display text-sm font-semibold leading-snug">{name}</h4>
      <p className="mt-1.5 font-display text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-brand-orange">{role}</p>
      {bio && <p className="mt-2 text-xs leading-tight text-muted-foreground">{bio}</p>}
    </article>
  );
}

export function Management() {
  const { data: people = [] } = useQuery(managementQuery());
  const board = people.filter((p) => p.group === "board");
  const executives = people.filter((p) => p.group === "executive");
  const senior = SENIOR_CARD;
  return (
    <section id="management" className="mx-auto max-w-[1400px] px-5 py-20 lg:px-10 lg:py-28">
      <div className="max-w-3xl">
        <p className="eyebrow">Management</p>
        <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">Leadership & Management</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Experienced leadership driving performance, governance and sustainable growth.
        </p>
      </div>

      <div className="mt-12 space-y-14">
        {/* 1. Board of Directors */}
        <div id="board-of-directors" className="scroll-mt-32">
          <GroupHeading title="Board Of Directors" />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {board.map((p) => (
              <li key={p.id}>
                <Link to="/board-of-directors/$slug" params={{ slug: p.slug }} aria-label={`View profile of ${p.name}`} className={linkCls}>
                  <CardBody name={p.name} role={p.designation} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. Executive Leadership */}
        <div id="executive-leadership" className="scroll-mt-32">
          <GroupHeading title="Executive Leadership" />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {executives.map((e) => (
              <li key={e.id}>
                <Link to="/executive-leadership/$slug" params={{ slug: e.slug }} aria-label={`View profile of ${e.name}`} className={linkCls}>
                  <CardBody name={e.name} role={e.designation} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. Senior Management */}
        <div id="senior-management" className="scroll-mt-32">
          <GroupHeading title="Senior Management" />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <li className="sm:col-span-2">
              <Link to="/senior-management" aria-label="View Senior Management" className={linkCls}>
                <CardBody name={senior.name} role={senior.role} bio={senior.bio} />
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
