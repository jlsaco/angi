"use client";

import React, { createContext, useContext } from "react";
import type { AngiPermission } from "./types";

export interface AngiComponentContextValue {
  id?: string; // optional — if absent, useAngiComponent derives one from description
  permissions: AngiPermission[];
}

const AngiComponentContext =
  createContext<AngiComponentContextValue | null>(null);

export function useAngiComponentContext(): AngiComponentContextValue {
  const ctx = useContext(AngiComponentContext);
  if (!ctx) {
    throw new Error(
      "useAngiComponent must be called inside an <Angi> boundary wrapper"
    );
  }
  return ctx;
}

interface AngiProps {
  id?: string; // optional — Angi will derive a stable ID from description if omitted
  permissions?: AngiPermission[];
  children: React.ReactNode;
}

/**
 * Angi — boundary wrapper for AI-addressable components.
 *
 * Provides id (optional) + permissions in context.
 * Default permissions: ["read", "write"]
 *
 * Usage (with explicit id):
 *   <Angi id="contact-form" permissions={["read"]}>
 *     <ContactForm />
 *   </Angi>
 *
 * Usage (auto-id and default permissions):
 *   <Angi>
 *     <ContactForm />
 *   </Angi>
 */
export function Angi({
  id,
  permissions = ["read", "write"],
  children,
}: AngiProps) {
  return (
    <AngiComponentContext.Provider value={{ id, permissions }}>
      {children}
    </AngiComponentContext.Provider>
  );
}
