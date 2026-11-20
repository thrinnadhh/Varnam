import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/db/actions";
import { PDPClient } from "@/components/pdp-client";
import { ProductCard } from "@/components/product-card";
import { ChevronRight, Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Dress Not Found",
    };
  }

  const primaryImage =
    product.product_images.find((img) => img.is_primary) ||
    product.product_images[0];

  const segmentSuffix =
    product.segment === "women"
      ? "(Sizes XS–XXL)"
      : product.segment === "teens"
      ? "(Ages 13–18Y)"
      : "(Ages 2–12Y)";

  const segmentBrand =
    product.segment === "women"
      ? "Women's Couture"
      : product.segment === "teens"
      ? "Teens Festive"
      : "Girls' Apparel";

  return {
    title: `${product.name} ${segmentSuffix}`,
    description: `${product.description} Handcrafted in ${product.fabric} with ${product.lining}.`,
    openGraph: {
      title: `${product.name} | Varnam ${segmentBrand}`,
      description: product.description,
      images: primaryImage ? [primaryImage.image_url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related designs from the same category
  const relatedProducts = await getProducts({
    categorySlug: product.categories.slug,
    limit: 4,
  });

  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3);

  // Construct JSON-LD Schema
  const primaryImage =
    product.product_images.find((img) => img.is_primary) ||
    product.product_images[0];

  const minPrice = Math.min(
    ...product.product_variants.map((v) => v.price)
  );
  const maxPrice = Math.max(
    ...product.product_variants.map((v) => v.price)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: primaryImage?.image_url,
    category: product.categories.name,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: (minPrice / 100).toFixed(2),
      highPrice: (maxPrice / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Varnam",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-12">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs sm:text-sm text-text-muted"
        >
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-border" />
          <Link
            href="/collections"
            className="hover:text-brand-primary transition-colors"
          >
            Collections
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-border" />
          <Link
            href={`/collections/${product.categories.slug}`}
            className="hover:text-brand-primary transition-colors capitalize"
          >
            {product.categories.name}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-border" />
          <span className="text-text-heading font-medium truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Interactive PDP Client Component */}
        <PDPClient product={product} />

        {/* Related Dresses Recommendation */}
        {filteredRelated.length > 0 && (
          <section className="pt-12 border-t border-border space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-secondary text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated for You</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-text-heading">
                  More in {product.categories.name}
                </h2>
              </div>
              <Link
                href={`/collections/${product.categories.slug}`}
                className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover underline"
              >
                View all styles &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRelated.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
