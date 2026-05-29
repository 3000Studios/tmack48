import Seo from "@/components/ui/Seo";
import { siteConfig } from "@/data/siteConfig";

export default function Refunds() {
  return (
    <>
      <Seo
        path="/refunds"
        title="Refund Policy"
        description="TMACK48 refund policy for digital goods, merch, donations, and tips."
      />
      <article className="container-lux py-16 max-w-3xl text-platinum/80 space-y-6">
        <h1 className="display-title text-4xl sm:text-5xl font-black platinum-text">Refund Policy</h1>
        <p>
          This policy applies to all purchases, tips, donations, digital goods, and services offered
          through {siteConfig.url} or its linked third-party providers.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">All sales are final</h2>
        <p>
          Because digital products and creative services are delivered or made available
          immediately, <strong className="text-platinum">all sales are final and non-refundable</strong>,
          except where a refund is required by applicable law that cannot be waived in your
          jurisdiction. Tips and donations are voluntary and non-refundable.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Merchandise</h2>
        <p>
          Physical merchandise, where offered, is fulfilled by third-party providers and is subject to
          their return and exchange terms. Damaged or defective items should be reported promptly with
          photos so we can help coordinate a resolution with the provider.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Payment disputes</h2>
        <p>
          Payments are processed by third parties (such as PayPal, Cash App, Stripe, or Shopify) under
          their own terms. If you believe a charge was made in error, contact us first so we can
          investigate before opening a dispute.
        </p>

        <h2 className="display-title text-2xl font-bold text-platinum mt-8">Contact</h2>
        <p>
          For any billing question, email{" "}
          <a className="text-gold-300 link-rise" href={`mailto:${siteConfig.contact.email}`}>
            {siteConfig.contact.email}
          </a>{" "}
          before initiating a chargeback.
        </p>
        <p className="text-xs uppercase tracking-[0.3em] text-platinum/50 pt-8">
          Last updated: {new Date().getFullYear()}
        </p>
        <p className="text-xs text-platinum/40">
          {/* This policy is provided for general information and is not legal advice. Have an attorney review before relying on it. */}
        </p>
      </article>
    </>
  );
}
