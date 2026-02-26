"use client";

import React, { createContext, useContext } from "react";
import type { AngiPermission } from "./types";

export interface AngiComponentContextValue {
  id: string;
  permissions: AngiPermission[];
}

const AngiComponentContext =
  createContext<AngiComponentContextValue | null>(null);

export function useAngiComponentContext(): AngiComponentContextValue {
  const ctx = useContext(AngiComponentContext);
  if (!ctx) {
    throw new Error(
      "useAngiComponent must be called inside an <Angi.*> boundary wrapper"
    );
  }
  return ctx;
}

interface AngiWrapperProps {
  id: string;
  permissions: AngiPermission[];
  children: React.ReactNode;
}

/** Core thin wrapper — just provides id + permissions in context */
function AngiWrapper({ id, permissions, children }: AngiWrapperProps) {
  return (
    <AngiComponentContext.Provider value={{ id, permissions }}>
      {children}
    </AngiComponentContext.Provider>
  );
}

/**
 * Angi — namespace of thin boundary wrappers.
 *
 * Usage:
 *   <Angi.Form id="contact-form" permissions={["read", "write"]}>
 *     <ContactForm />
 *   </Angi.Form>
 *
 * The child component calls useAngiComponent() to register itself.
 */
export const Angi = {
  Form: (props: AngiWrapperProps) => <AngiWrapper {...props} />,
  Table: (props: AngiWrapperProps) => <AngiWrapper {...props} />,
  Section: (props: AngiWrapperProps) => <AngiWrapper {...props} />,
};
