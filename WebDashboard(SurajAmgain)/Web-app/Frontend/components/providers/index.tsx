// components/providers/index.ts
'use client';

import { ReactNode } from 'react';
import { IoTDataProvider } from './iot-data-provider';
import { AlertProvider } from './alert-provider';
import { ThemeProvider } from './theme-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AlertProvider>
        <IoTDataProvider>
          {children}
        </IoTDataProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}