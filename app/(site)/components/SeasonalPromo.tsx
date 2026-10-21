"use client";

import React from "react";
import { Carousel, Typography } from "antd";
import Link from "next/link";

const { Text } = Typography;

const SeasonalPromo = ({
  season,
}: {
  season: "christmas" | "newYear" | null;
}) => {
  if (!season) return null;

  const christmasOffers = [
    {
      text: "HOLIDAY SALE: UP TO 50% OFF SELECTED STYLES",
      link: "/collections/deals",
    },
    {
      text: "FREE SHIPPING ON ORDERS OVER LKR 10,000",
      link: "/collections/products",
    },
    {
      text: "GIFT GUIDE: THE PERFECT PAIR FOR EVERYONE",
      link: "/collections/products",
    },
    { text: "EXTENDED RETURNS UNTIL JANUARY 15TH", link: "/pages/returns" },
  ];

  const newYearOffers = [
    {
      text: "START FRESH: NEW YEAR COLLECTION LIVE NOW",
      link: "/collections/new-arrivals",
    },
    { text: "LIMITED TIME: BUY 2 GET 10% OFF", link: "/collections/deals" },
    { text: "STEP INTO 2026 WITH STYLE", link: "/collections/products" },
  ];

  const offers = season === "christmas" ? christmasOffers : newYearOffers;

  const bgClass =
    season === "christmas"
      ? "bg-primary-600 text-inverse"
      : "bg-primary-50 text-primary-dark";

  return (
    <div className={`w-full ${bgClass} relative z-50`}>
      <div className="max-w-content mx-auto px-4">
        <Carousel
          autoplay
          dots={false}
          effect="fade"
          style={{ height: "36px" }}
        >
          {offers.map((offer, index) => (
            <div key={index}>
              <Link
                href={offer.link}
                className="flex items-center justify-center h-9 w-full text-center"
              >
                <Text
                  style={{
                    color: "inherit",
                    fontSize: "10px",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                    cursor: "pointer",
                  }}
                  className="hover:text-primary-dark transition-colors"
                >
                  {offer.text}
                </Text>
              </Link>
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default SeasonalPromo;
