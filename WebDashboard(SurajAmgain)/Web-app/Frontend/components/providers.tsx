'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { IoTDataProvider } from '@/components/providers/iot-data-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <IoTDataProvider>{children}</IoTDataProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
