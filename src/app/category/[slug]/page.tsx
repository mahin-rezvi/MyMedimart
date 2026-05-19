import ComingSoonPage from "@/components/common/coming-soon-page";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const title = `${slug.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())} Category`;
  return (
    <ComingSoonPage
      title={title}
      description={`We are building the best shopping experience for the ${slug} category. Browse all products while we finish this page.`}
      actionHref="/products"
      actionLabel="Browse all products"
    />
  );
}
