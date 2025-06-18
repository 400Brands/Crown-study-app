export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CrownStudy",
  description: "Your ultimate companion for academic success.",
  navItems: [
    {
      label: "Home",
      href: "/dashboard",
    },
    {
      label: "Features",
      href: "/features",
    },
    {
      label: "How it works",
      href: "/workings",
    },
    {
      label: "Testimonies",
      href: "/testimonial",
    },
    {
      label: "About Us",
      href: "/about-us",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
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
