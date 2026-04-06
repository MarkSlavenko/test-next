import { getSearchHistory } from '@/lib/api';
import SearchApp from '@/components/SearchApp';

export default async function Home() {
  const initialHistory = await getSearchHistory();

  return (
    <SearchApp initialHistory={initialHistory} />
  );
}