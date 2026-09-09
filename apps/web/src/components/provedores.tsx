"use client";

import { SessionProvider } from "next-auth/react";
import { RegistrarSW } from "./registrar-sw";

export function Provedores({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RegistrarSW />
      {children}
    </SessionProvider>
  );
}
