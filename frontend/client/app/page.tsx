import { redirect } from 'next/navigation';

export default function Home() {
  // Server-side: always redirect to login (client handles auth check)
  redirect('/login');
}
