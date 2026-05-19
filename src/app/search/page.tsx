import ComingSoonPage from "@/components/common/coming-soon-page";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim();
  return (
    <ComingSoonPage
      title={query ? `Search results for “${query}”` : "Search products"}
      description={
        query
          ? "Search is being upgraded. In the meantime, browse our catalog and find your favorite items."
          : "Enter a search term to find products, brands, or categories."
      }
      actionHref="/products"
      actionLabel="Browse products"
    />
  );
}
