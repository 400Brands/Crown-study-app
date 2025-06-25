//@ts-nocheck

import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { CrownIcon } from "lucide-react";
import GetStarted from "./modal";

export const Navbar = () => {
  const handleScroll = (e, href) => {
    e.preventDefault();

    if (href.startsWith("#")) {
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const navbarHeight = 80; // Adjust based on your navbar height
        const elementPosition = targetElement.offsetTop - navbarHeight;

        window.scrollTo({
          top: elementPosition,
          behavior: "smooth",
        });
      }
    } else {
      window.location.href = href;
    }
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-2"
            color="foreground"
            href="/"
          >
            <CrownIcon className="font-bold" />
            <p className="font-bold text-xl ">
              Crown<span className="text-blue-700">Study</span>{" "}
            </p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <div className="hidden lg:flex gap-4 justify-start ml-2">
        {siteConfig.navItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              className={clsx(
                linkStyles({ color: "foreground" }),
                "data-[active=true]:text-primary data-[active=true]:font-medium"
              )}
              color="foreground"
              href={item.href}
              onClick={(e) => handleScroll(e, item.href)}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </div>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <GetStarted size="md" />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item.label}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href={item.href}
                onClick={(e) => handleScroll(e, item.href)}
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
