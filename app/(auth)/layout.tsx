'use client';

import { Suspense, type ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <main>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </main>
    </div>
  );
}
