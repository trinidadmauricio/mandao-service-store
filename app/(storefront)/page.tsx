import { HeroBanner } from '@/components/home/hero-banner';
import { FeaturedProducts } from '@/components/home/featured-products';
import { CategoryShowcase } from '@/components/home/category-showcase';

export default function Home() {
  return (
    <div className="flex flex-col">
      <div className="container py-8">
        <HeroBanner />
      </div>
      <FeaturedProducts />
      <CategoryShowcase />
    </div>
  );
}

