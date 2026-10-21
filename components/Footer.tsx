import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import { ArrowUpRight, MapPin, Phone, Mail } from "lucide-react";
import {
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoTiktok,
  IoLogoWhatsapp,
} from "react-icons/io5";
import {
  address,
  contactInfo,
  informationLinks,
  socialMedia,
} from "@/constants";
import type { NavigationItem, SocialMediaItem } from "@/actions/websiteAction";

export default function Footer({
  footerNav = [],
  socialLinks = [],
}: {
  footerNav?: NavigationItem[];
  socialLinks?: SocialMediaItem[];
}) {
  const helpLinks = footerNav.length
    ? footerNav
    : [
        { title: "Shipping & Delivery", link: "/policies/shipping-return-policy" },
        { title: "Returns & Exchanges", link: "/policies/shipping-return-policy" },
        { title: "Payment Options", link: "/checkout" },
        { title: "Contact Support", link: "/contact" },
        { title: "Terms & Conditions", link: "/policies/terms-conditions" },
        { title: "Privacy Policy", link: "/policies/privacy-policy" },
      ];

  const defaultSocials = [
    {
      name: "Instagram",
      url: "https://www.instagram.com/neverbe.196",
      icon: IoLogoInstagram,
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1GaP5gJB2p/",
      icon: IoLogoFacebook,
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@neverbe196",
      icon: IoLogoTiktok,
    },
    {
      name: "WhatsApp",
      url: "https://wa.me/94729249999",
      icon: IoLogoWhatsapp,
    },
  ];

  return (
    <footer className="sport-footer" id="footer">
      <div className="sport-footer-inner">
        {/* Main Multi-Column Grid (Nike / Adidas Sportswear Standard) */}
        <div className="sport-footer-grid">
          {/* Column 1: Featured & Resources (Bold Uppercase) */}
          <div className="sport-footer-col sport-footer-featured">
            <Link href="/" className="sport-footer-brand-logo" aria-label="NEVERBE Home">
              <BrandLogo />
            </Link>
            <p className="sport-footer-motto">
              Good gear. Different energy. High-performance footwear &amp; apparel engineered for everyday movement.
            </p>
            <nav className="sport-footer-nav-bold" aria-label="Featured Links">
              <Link href="/contact" className="sport-footer-bold-link">
                FIND OUR STORE <ArrowUpRight size={13} className="shrink-0" />
              </Link>
              <Link href="/collections/new-arrivals" className="sport-footer-bold-link">
                NEW ARRIVALS
              </Link>
              <Link href="/collections/products" className="sport-footer-bold-link">
                SHOP ALL GEAR
              </Link>
              <Link href="/collections/combos" className="sport-footer-bold-link">
                COMBOS &amp; BUNDLES
              </Link>
              <Link href="/collections/offers" className="sport-footer-bold-link">
                EXCLUSIVE OFFERS
              </Link>
            </nav>
          </div>

          {/* Column 2: Get Help */}
          <div className="sport-footer-col">
            <h3 className="sport-footer-heading">GET HELP</h3>
            <nav className="sport-footer-links" aria-label="Customer Care Links">
              {helpLinks.map((item) => (
                <Link href={item.link} key={item.link} className="sport-footer-link">
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: About NEVERBE */}
          <div className="sport-footer-col">
            <h3 className="sport-footer-heading">ABOUT NEVERBE</h3>
            <nav className="sport-footer-links" aria-label="About NEVERBE">
              <Link href="/aboutUs" className="sport-footer-link">
                About Us
              </Link>
              <a
                href={address.map}
                target="_blank"
                rel="noopener noreferrer"
                className="sport-footer-link"
              >
                Delgoda Flagship Store
              </a>
              <Link href="/aboutUs" className="sport-footer-link">
                Authenticity &amp; Craft
              </Link>
              <Link href="/contact" className="sport-footer-link">
                Contact Us
              </Link>
              <Link href="/account" className="sport-footer-link">
                Member Account
              </Link>
            </nav>
          </div>

          {/* Column 4: Community & Circular Socials (Nike Style) */}
          <div className="sport-footer-col sport-footer-connect">
            <h3 className="sport-footer-heading">FOLLOW US</h3>
            <div className="sport-footer-socials" aria-label="Social media channels">
              {defaultSocials.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sport-footer-social-btn"
                    aria-label={`Follow NEVERBE on ${social.name}`}
                  >
                    <IconComponent size={16} />
                  </a>
                );
              })}
            </div>

            <div className="sport-footer-contacts">
              <a href="tel:+94729249999" className="sport-footer-contact-item">
                <Phone size={13} className="shrink-0" />
                <span>+94 72 924 9999</span>
              </a>
              <a href="mailto:info@neverbe.lk" className="sport-footer-contact-item">
                <Mail size={13} className="shrink-0" />
                <span>info@neverbe.lk</span>
              </a>
              <span className="sport-footer-hours">
                Mon – Sun · 9:00 AM – 9:00 PM
              </span>
            </div>
          </div>
        </div>

        {/* Nike-Style Utility Sub-Footer Bar */}
        <div className="sport-footer-bottom">
          <div className="sport-footer-sub-left">
            <a
              href={address.map}
              target="_blank"
              rel="noopener noreferrer"
              className="sport-footer-location"
              aria-label="Store Location"
            >
              <MapPin size={13} className="shrink-0" />
              <span>Sri Lanka</span>
            </a>
            <span className="sport-footer-copyright">
              © {new Date().getFullYear()} NEVERBE, Inc. All Rights Reserved
            </span>
          </div>

          <div className="sport-footer-sub-links" aria-label="Legal & Policy Links">
            <Link href="/policies/terms-conditions">Terms of Sale</Link>
            <Link href="/policies/terms-conditions">Terms &amp; Conditions</Link>
            <Link href="/policies/privacy-policy">Privacy Policy</Link>
            <Link href="/policies/shipping-return-policy">Shipping &amp; Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
