import { ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import logoAsset from "@/assets/ramky-logo-transparent.png.asset.json";
import milesCityLogo from "@/assets/miles-city.png.asset.json";
import ramkyEstatesLogo from "@/assets/ramky-estates.svg.asset.json";
import recepsLogo from "@/assets/receps.png.asset.json";
import visakhaPharmacityLogo from "@/assets/visakha-pharmacity.jpg.asset.json";
const logo = logoAsset.url;

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "Management", href: "/#management" },
      { label: "Awards & Accreditations", href: "/accolades" },
      { label: "Media", href: "/media" },
      { label: "CSR", href: "/#csr" },
    ],
  },
  {
    title: "Businesses",
    links: [
      { label: "Capabilities", href: "/#businesses" },
      { label: "Clientele", href: "/about/clientele" },
      { label: "Partners", href: "/about/partners/subsidiaries" },
    ],
  },
  {
    title: "People & Careers",
    links: [
      { label: "Life at Ramky", href: "/life-at-ramky" },
      { label: "Current Positions", href: "/current-positions" },
    ],
  },
  {
    title: "Investors",
    links: [
      { label: "Financial Results", href: "/investors?cat=financials" },
      { label: "Corporate Governance", href: "/investors?cat=corporate-governance" },
      { label: "Shareholders Information", href: "/investors?cat=shareholders-information" },
      { label: "Stock Exchange Filings", href: "/investors?cat=stock-exchange-filings" },
    ],
  },
];

const GROUP_COMPANIES = [
  {
    name: "MILES City",
    href: "https://milescity.in",
    logo: milesCityLogo.url,
  },
  {
    name: "Ramky Estates",
    href: "https://www.ramkyestates.com/",
    logo: ramkyEstatesLogo.url,
  },
  {
    name: "Visakha Pharmacity Limited",
    href: "https://visakhapharmacity.com/",
    logo: visakhaPharmacityLogo.url,
  },
  {
    name: "RECEPS",
    href: "https://receps.org/",
    logo: recepsLogo.url,
  },
] as const;

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t-2 border-footer-accent bg-footer-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_3fr]">
          <div>
            <img
              src={logo}
              alt="Ramky Infrastructure logo"
              width={150}
              height={142}
              loading="lazy"
              className="h-20 w-auto object-contain"
            />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              An integrated infrastructure developer delivering water, transportation, irrigation,
              environment and urban infrastructure across India and overseas.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-foreground/80">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                Ramky Grandiose, Sy. No. 136/2 &amp; 4, Gachibowli, Hyderabad 500032, India
              </li>
              <li className="flex gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                +91 40 2301 5000
              </li>
              <li className="flex gap-3">
                <Mail className="mt-0.5 size-4 shrink-0 text-brand-orange" />
                info@ramkyinfrastructure.com
              </li>
            </ul>
          </div>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.3fr]">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-footer-accent">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        onClick={l.href === "/#csr" ? () => {
                          if (window.location.pathname === "/" && window.location.hash === "#csr") {
                            window.dispatchEvent(new Event("ramky:open-csr"));
                          }
                        } : undefined}
                        className="text-sm text-muted-foreground transition-colors hover:text-footer-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr className="footer-rule mt-14" aria-hidden="true" />
        <section className="pt-10" aria-labelledby="group-companies-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Ramky Group</p>
              <h2 id="group-companies-heading" className="mt-2 text-xl font-semibold text-footer-accent">
                Group Companies
              </h2>
            </div>
            <p className="hidden text-sm text-muted-foreground sm:block">Visit our group companies</p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {GROUP_COMPANIES.map((company) => (
              <a
                key={company.name}
                href={company.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${company.name} website (opens in a new tab)`}
                className="group relative flex h-28 items-center justify-center p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <img
                  src={company.logo}
                  alt={`${company.name} logo`}
                  loading="lazy"
                  className="max-h-16 max-w-full object-contain"
                />
                <ExternalLink
                  aria-hidden="true"
                  className="absolute right-2 top-2 size-3.5 text-muted-foreground transition-colors group-hover:text-footer-accent"
                />
              </a>
            ))}
          </div>
        </section>

        <hr className="footer-rule mt-10" aria-hidden="true" />
        <div className="flex flex-col gap-3 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Ramky Infrastructure Limited. All rights reserved.</p>
          <p className="uppercase tracking-[0.16em]">Towards sustainable growth</p>
        </div>
      </div>
    </footer>
  );
}
