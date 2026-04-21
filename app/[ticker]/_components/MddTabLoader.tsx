import { calcMdd, fetchCloses } from '@/entities/sigma';
import { MddTab } from '@/widgets/mdd-tab';

export default async function MddTabLoader({ slug, symbol }: { slug: string; symbol: string }) {
  const closesMax = await fetchCloses(slug, 'max');
  const mddResult = calcMdd(closesMax);

  return <MddTab mdd={mddResult} symbol={symbol} dataCount={closesMax.length} />;
}
