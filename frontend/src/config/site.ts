export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CrownStudy",
  description: "Your ultimate companion for academic success.",
  navItems: [
    {
      label: "Home",
      href: "#hero", // or "#" to scroll to top
    },
    {
      label: "Features",
      href: "#features",
    },
    {
      label: "How it works",
      href: "#how-it-works",
    },
    {
      label: "Testimonies",
      href: "#testimonials",
    },
    {
      label: "FAQ",
      href: "#faq",
    },
  ],
  navMenuItems: [
    {
      label: "Home",
      href: "#hero",
    },
    {
      label: "Features",
      href: "#features",
    },
    {
      label: "How it works",
      href: "#how-it-works",
    },
    {
      label: "Testimonies",
      href: "#testimonials",
    },
    {
      label: "FAQ",
      href: "#faq",
    },
  ],
  links: {
    github: "/",
    twitter: "/",
    docs: "/",
    discord: "/",
    sponsor: "/",
  },
};
