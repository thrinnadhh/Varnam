import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug, getProducts } from "@/lib/db/actions";
import { PDPClient } from "@/components/pdp-client";
import { ProductCard } from "@/components/product-card";
import type { SizeChartItem } from "@/components/size-guide-modal";
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
    title: `${product.name} ${segmentSuffix} | Varnam`,
    description: `${product.description} Handcrafted in ${product.fabric} with ${product.lining}. 1-inch inner growth seam allowance included.`,
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

  const relatedProducts = await getProducts({
    categorySlug: product.categories?.slug,
    limit: 4,
  });

  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3);

  const primaryImage =
    product.product_images.find((img) => img.is_primary) ||
    product.product_images[0];

  const minPrice = Math.min(...product.product_variants.map((v) => v.price));
  const maxPrice = Math.max(...product.product_variants.map((v) => v.price));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: primaryImage ? [primaryImage.image_url] : [],
    category: product.categories?.name,
    brand: {
      "@type": "Brand",
      name: "Varnam",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: (minPrice / 100).toFixed(2),
      highPrice: (maxPrice / 100).toFixed(2),
      offerCount: product.product_variants.length,
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

      <div className="space-y-10">
        {/* Breadcrumb Bar */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center space-x-2 text-xs sm:text-sm text-[#6B574B] bg-[#FAF5EB] p-3 rounded-xl border border-[#D8C7AE]"
        >
          <Link href="/" className="hover:text-[#8B1E3F] transition-colors font-medium">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-[#D8C7AE]" />
          <Link
            href="/collections"
            className="hover:text-[#8B1E3F] transition-colors font-medium"
          >
            Collections
          </Link>
          {product.categories && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#D8C7AE]" />
              <Link
                href={`/collections/${product.categories.slug}`}
                className="hover:text-[#8B1E3F] transition-colors font-medium capitalize"
              >
                {product.categories.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-[#D8C7AE]" />
          <span className="text-[#261C17] font-bold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Interactive PDP Client Component */}
        <PDPClient
          product={{
            ...product,
            size_chart: Array.isArray(product.size_chart)
              ? (product.size_chart as unknown as SizeChartItem[])
              : null,
          }}
        />

        {/* Curated Recommendations */}
        {filteredRelated.length > 0 && (
          <section className="pt-8 border-t border-[#D8C7AE] space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-[#8B1E3F] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#C69214]" />
                  <span>Celebration Recommendations</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#261C17]">
                  More Handcrafted Styles
                </h2>
              </div>
              {product.categories && (
                <Link
                  href={`/collections/${product.categories.slug}`}
                  className="text-xs sm:text-sm font-bold text-[#8B1E3F] hover:text-[#721531] underline"
                >
                  View all in {product.categories.name} &rarr;
                </Link>
              )}
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
