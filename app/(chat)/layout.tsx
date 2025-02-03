import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { config } from '@/app/(auth)/auth';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import Script from 'next/script';

export const experimental_ppr = true;

interface Props {
  children: React.ReactNode;
}

export default async function Layout({ children }: Props) {
  const [session, cookieStore] = await Promise.all([
    getServerSession(config),
    cookies()
  ]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar user={session?.user} />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </>
  );
}
