import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ProductsHeader() {
  return (
    <section className="sport-section sport-catalog-heading">
      <div className="sport-section-heading">
        <div>
          <p className="sport-eyebrow">FIND YOUR NEXT ROTATION</p>
          <h1>Shoes, clothing & everyday essentials.</h1>
          <p>
            Good gear for wherever you’re headed. Shop the NEVERBE collection.
          </p>
        </div>
        <Link href="/collections/combos" className="sport-text-link">
          Explore combos <ArrowUpRight size={18} />
        </Link>
      </div>
    </section>
  );
}
