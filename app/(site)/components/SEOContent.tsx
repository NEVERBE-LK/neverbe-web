import Link from "next/link";

export default function SEOContent() {
  return (
    <section
      className="sport-local sport-section"
      aria-labelledby="local-heading"
    >
      <div>
        <p className="sport-eyebrow">YOUR LOCAL DESTINATION</p>
        <h2 id="local-heading">
          Sneakers & sportswear.
          <br />
          Delivered across Sri Lanka.
        </h2>
      </div>
      <div>
        <p>
          Discover sneakers, running shoes, activewear and everyday clothing at
          NEVERBE. Shop online from Colombo, Kandy, Galle, Jaffna and across the
          island, with prices in Sri Lankan rupees and cash on delivery
          available.
        </p>
        <p>
          Explore the latest arrivals, find your fit, and check our delivery and
          return policy before you order. Need a hand? Our team in Delgoda is
          here to help.
        </p>
        <div className="sport-local-links">
          <Link href="/collections/new-arrivals">New arrivals</Link>
          <Link href="/collections/products">Shoes & clothing</Link>
          <Link href="/policies/shipping-return-policy">
            Delivery & returns
          </Link>
          <Link href="/contact">Contact us</Link>
        </div>
      </div>
    </section>
  );
}
