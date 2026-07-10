import NotFoundContent from '@/src/components/NotFoundContent';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found | MIR Housing',
};

export default function NotFound() {
  return <NotFoundContent />;
}
