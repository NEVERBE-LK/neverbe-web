import Link from "next/link";

const guides: Record<string, { title: string; body: string }> = {
  sneakers: {
    title: "Choose sneakers for your routine",
    body: "Think about where you will wear your sneakers most: commuting, casual outings or everyday walking. Compare the listed sizes and colour options, and use the size guide before selecting a pair.",
  },
  "running-shoes": {
    title: "Find the right fit for your runs",
    body: "Consider your usual running surface, distance and preferred fit. Check each product's description for its intended use; casual sneakers and running footwear can serve different needs. Contact us if a fit or construction detail is missing.",
  },
  "slides-sandals": {
    title: "Choose your everyday slides or sandals",
    body: "Compare the available sizes, strap shape and coverage in the product photos. Think about how you plan to wear the pair, and check the size guide instead of assuming all brands fit alike.",
  },
  boots: {
    title: "Check the fit before choosing boots",
    body: "Consider ankle coverage, fastening and the socks you plan to wear. Review the product photos and available sizes, and ask our team about any construction details that aren't listed.",
  },
  "mens-clothing": {
    title: "Build your everyday wardrobe",
    body: "Choose clothing around how you plan to wear it: a relaxed everyday outfit, layering or training. Check the listed fit and available sizes. If garment measurements or fabric information aren't provided, contact us before ordering.",
  },
  activewear: {
    title: "Choose clothing for your training",
    body: "Think about your workout, preferred coverage and freedom of movement. Check each product's listed fabric and fit where available; ask our team about missing measurements before choosing a size.",
  },
  "sports-apparel": {
    title: "Choose apparel for your activity",
    body: "Match your clothing to your activity, preferred fit and layering needs. Review the product description and available sizes, and contact us when you need more information about fabric or garment measurements.",
  },
  accessories: {
    title: "Complete your everyday kit",
    body: "Compare the product's listed dimensions, size options and photos to check that it suits your needs. For bags, socks and other accessories, contact us if a capacity, fit or material detail isn't listed.",
  },
  offers: {
    title: "Compare the offer before you order",
    body: "Review the current price in Sri Lankan rupees, available sizes and any promotion conditions. Coupon and bundle terms can differ; checkout confirms the applicable discounts and delivery fee for your order.",
  },
  combos: {
    title: "Check what's included in your bundle",
    body: "Open a bundle to review its included products, selection requirements and current price. Choose the available options for each item, and review the order total and delivery fee before confirming.",
  },
  "new-arrivals": {
    title: "Explore the latest additions",
    body: "Compare newly listed styles by their product details, available sizes and price in Sri Lankan rupees. Use the size guide and product photos to narrow down your choice, or ask our team for help with fit.",
  },
};

export default function CollectionAdvice({
  collection = "products",
}: {
  collection?: string;
}) {
  const guide = guides[collection] || {
    title: "Find your next everyday essential",
    body: "Browse footwear, clothing and accessories by category, size and current availability. Compare product details and prices in Sri Lankan rupees. Check the size guide or contact our team if you need help choosing a fit.",
  };
  return (
    <section
      className="collection-advice"
      aria-labelledby="collection-advice-title"
    >
      <div>
        <h2 id="collection-advice-title">{guide.title}</h2>
        <p>{guide.body}</p>
      </div>
      <div>
        <h2>Ordering in Sri Lanka</h2>
        <p>
          Delivery charges and available payment methods are confirmed at
          checkout. Read the delivery and exchange policy before ordering, or
          contact us with a question about a product.
        </p>
        <div className="collection-advice-links">
          <Link href="/policies/shipping-return-policy">
            Delivery &amp; exchanges
          </Link>
          <Link href="/contact">Ask about a product</Link>
        </div>
      </div>
      <div>
        <h2>Explore collections</h2>
        <div className="collection-advice-links">
          <Link href="/collections/sneakers">Sneakers</Link>
          <Link href="/collections/running-shoes">Running shoes</Link>
          <Link href="/collections/mens-clothing">Clothing</Link>
          <Link href="/collections/activewear">Activewear</Link>
          <Link href="/collections/slides-sandals">Slides &amp; sandals</Link>
        </div>
      </div>
    </section>
  );
}
