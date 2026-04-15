import { readData } from '@/lib/data';
import ClientPage from './ClientPage';

export const dynamic = 'force-dynamic';

export default function Home() {
  const data = readData();

  return <ClientPage initialData={data} />;
}