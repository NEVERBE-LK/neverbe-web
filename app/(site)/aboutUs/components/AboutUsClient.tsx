"use client";

import React from "react";
import { Typography, Row, Col, Space } from "antd";

const { Title, Paragraph, Text } = Typography;

const AboutUsClient = () => {
  return (
    <div className="commerce-legacy w-full bg-surface text-primary min-h-screen pt-28 md:pt-36 pb-20">
      {/* 1. HERO MANIFESTO */}
      <section className="w-full px-4 md:px-8 mb-16">
        <div className="max-w-[1400px] mx-auto">
          <span className="v2-section-label mb-3">OUR STORY &amp; MANIFESTO</span>
          <h1 className="v2-section-title text-[clamp(3rem,8vw,6rem)] font-black uppercase tracking-tight text-primary mb-4">
            We Are <br /> Neverbe.
          </h1>
          <p className="text-[clamp(1rem,2vw,1.5rem)] font-extrabold uppercase tracking-wide text-accent max-w-3xl">
            Redefining sneaker culture &amp; lifestyle apparel in Sri Lanka. Premium quality. Unbeatable prices. No compromises.
          </p>
        </div>
      </section>

      {/* 2. THE STORY (Split Layout) */}
      <section className="w-full border-t border-glass-border px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto">
          <Row gutter={[48, 48]} justify="space-between">
            {/* Left: Headline */}
            <Col xs={24} md={8} lg={6}>
              <div className="sticky top-28 h-fit">
                <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-black uppercase tracking-tight text-primary mb-3">
                  The Mission
                </h2>
                <div className="h-2 w-20 bg-accent rounded-full"></div>
              </div>
            </Col>

            {/* Right: Content */}
            <Col xs={24} md={16} lg={14}>
              <Space direction="vertical" size={48} className="w-full">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-primary mb-6">
                    Who We Are
                  </h2>
                  <div className="max-w-3xl space-y-6">
                    <p className="text-base md:text-lg text-secondary leading-relaxed m-0">
                      Based in Sri Lanka, we recognized a gap in the market for high-end, streetwear-inspired footwear and apparel that doesn&apos;t compromise on quality. Our mission is simple: to provide the local community with access to global sneaker culture through carefully curated drops.
                    </p>
                    <p className="text-base md:text-lg text-secondary leading-relaxed m-0">
                      At Neverbe, we don&apos;t just sell shoes — we curate a lifestyle. We bridge the gap between high-end streetwear and affordability, offering premium products that rival top standards in look, feel, and durability.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold uppercase tracking-wider text-accent mb-3">
                    Our Vision
                  </h3>
                  <p className="text-base text-secondary leading-relaxed m-0">
                    Our vision is to become the undisputed leader in Sri Lankan streetwear and footwear. We operate with absolute transparency, focusing on ethical customer service and product quality. We believe style is a right, not a luxury reserved for the few.
                  </p>
                </div>
              </Space>
            </Col>
          </Row>
        </div>
      </section>

      {/* 3. WHY US (Grid System) */}
      <section className="w-full px-4 md:px-8 py-20 bg-surface">
        <div className="max-w-[1400px] mx-auto">
          <Row gutter={[24, 24]}>
            {[
              {
                title: "Premium Quality",
                desc: "We stock only Premium High-End products. Heavy materials, correct stitching, and durable soles.",
              },
              {
                title: "Island-wide Delivery",
                desc: "From Colombo to Jaffna, we deliver to your doorstep safely and securely within 3-5 working days.",
              },
              {
                title: "Cash on Delivery",
                desc: "Shop with total confidence. Inspect your package upon arrival and pay only when you are satisfied.",
              },
              {
                title: "Dedicated Support",
                desc: "Our team is here to help with sizing, styling, and order tracking via WhatsApp and Email.",
              },
            ].map((item, i) => (
              <Col xs={24} sm={12} lg={6} key={i}>
                <div className="v2-glass p-8 rounded-3xl h-full flex flex-col justify-between border border-glass-border hover:border-accent transition-colors">
                  <h3 className="text-xl font-black uppercase tracking-tight text-primary mb-3">
                    {item.title}
                  </h3>
                  <p className="text-xs text-secondary leading-relaxed m-0">
                    {item.desc}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* 4. STATS STRIP */}
      <section className="w-full px-4 md:px-8 py-16 border-t border-glass-border">
        <div className="max-w-[1400px] mx-auto">
          <Row gutter={[32, 32]} justify="space-between" align="middle">
            <Col xs={12} md={6}>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted block mb-1">
                Established
              </span>
              <span className="text-4xl font-black text-accent font-display">
                2023
              </span>
            </Col>
            <Col xs={12} md={6}>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted block mb-1">
                Customers
              </span>
              <span className="text-4xl font-black text-accent font-display">
                10,000+
              </span>
            </Col>
            <Col xs={12} md={6}>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted block mb-1">
                Products
              </span>
              <span className="text-4xl font-black text-accent font-display">
                500+
              </span>
            </Col>
            <Col xs={12} md={6}>
              <span className="text-xs font-extrabold uppercase tracking-widest text-muted block mb-1">
                Location
              </span>
              <span className="text-4xl font-black text-accent font-display">
                SRI LANKA
              </span>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default AboutUsClient;
