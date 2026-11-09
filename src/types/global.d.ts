import React from "react";

declare global {
  type LayoutProps<T = any> = {
    children: React.ReactNode;
    params?: Promise<Record<string, string | string[] | undefined>>;
  };

  type PageProps<T = any> = {
    params: Promise<Record<string, string | string[] | undefined>>;
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
  };
}

export {};

