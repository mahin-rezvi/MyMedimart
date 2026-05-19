import ComingSoonPage from "@/components/common/coming-soon-page";

interface CatchAllPageProps {
  params: Promise<{ page: string[] }>;
}

export default async function CatchAllPage({ params }: CatchAllPageProps) {
  const { page } = await params;
  const path = page.join("/");
  return (
    <ComingSoonPage
      title="Work in progress"
      description={`The page “/${path}” is being built. Explore existing sections like Home, Products, Cart and Account while we finish it.`}
      actionHref="/"
      actionLabel="Return Home"
    />
  );
}
