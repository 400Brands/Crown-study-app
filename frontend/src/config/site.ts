export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CrownStudy",
  description: "Your ultimate companion for academic success.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Features",
      href: "/#",
    },
    {
      label: "How it works",
      href: "/#",
    },
    {
      label: "Testimonies",
      href: "/#",
    },
    {
      label: "About Us",
      href: "/#",
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
