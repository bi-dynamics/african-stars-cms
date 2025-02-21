"use client";

import {
  Home,
  Newspaper,
  Youtube,
  UsersRound,
  Ticket,
  Tv,
  Pin,
  Vote,
  Gift,
  ShoppingCart,
  CalendarArrowUp,
  BookUser,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  {
    section: "Home",

    pages: [
      {
        name: "Featured News",
        href: "/dashboard/featured-news",
        icon: Newspaper,
      },
      {
        name: "Upcoming Events",
        href: "/dashboard/upcoming-events",
        icon: CalendarArrowUp,
      },
      {
        name: "Fan Highlights",
        href: "/dashboard/fan-highlights",
        icon: Youtube,
      },
    ],
  },
  {
    section: "Matches",

    pages: [
      {
        name: "Fixtures and Results",
        href: "/dashboard/fixtures-and-results",
        icon: Pin,
      },
      {
        name: "Teams",
        href: "/dashboard/teams",
        icon: BookUser,
      },
      {
        name: "Live Match Center",
        href: "/dashboard/live-match-center",
        icon: Tv,
      },
      {
        name: "Ticketing",
        href: "/dashboard/ticketing",
        icon: Ticket,
      },
    ],
  },
  {
    section: "Fan Zone",

    pages: [
      { name: "Voting", href: "/dashboard/voting", icon: Vote },
      { name: "Players", href: "/dashboard/players", icon: UsersRound },
      { name: "Points", href: "/dashboard/points", icon: Gift },
    ],
  },
  {
    section: "Shop",
    pages: [{ name: "Products", href: "/dashboard/shop", icon: ShoppingCart }],
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      <Link
        href="/dashboard"
        className={clsx(
          "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-red-600 md:flex-none md:justify-start md:p-2 md:px-3",
          {
            "bg-red-100 text-red-600": pathname === "/dashboard",
          }
        )}
      >
        <Home className="w-6" />
        <p className="hidden md:block">Dashboard</p>
      </Link>

      <div className="flex flex-col items-start justify-start gap-2 w-full pt-4">
        <p className="text-xs text-gray-500">Pages</p>
        {links.map((link, index) => {
          return (
            <Accordion key={index} type="single" collapsible className="w-full">
              <AccordionItem value={index.toString()}>
                <AccordionTrigger
                  className={clsx(
                    "font-bold bg-gray-50 text-black rounded-md p-3",
                    {
                      "bg-red-100 text-red-600": links.some(
                        (l) =>
                          l.section === link.section &&
                          l.pages.some((p) => p.href === pathname)
                      ),
                    }
                  )}
                >
                  {link.section}
                </AccordionTrigger>
                <AccordionContent className="mt-2 px-2">
                  {link.pages.map((page, index) => {
                    const LinkIcon = page.icon;

                    return (
                      <Link
                        key={index}
                        href={page.href}
                        className={clsx(
                          "flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-red-100 hover:text-red-600 md:flex-none md:justify-start md:p-2 md:px-3",
                          {
                            "bg-red-100 text-red-600": pathname === page.href,
                          }
                        )}
                      >
                        <LinkIcon className="w-6" />
                        <p className="hidden md:block">{page.name}</p>
                      </Link>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          );
        })}
      </div>
    </>
  );
}
