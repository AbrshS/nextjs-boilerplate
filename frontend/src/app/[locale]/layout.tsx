import type { Metadata } from "next";
import Providers from "./providers";
import "@/styles/globals.css";

// i18n
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";

export const metadata: Metadata = {
    title: "Fanaye Technologies · Enterprise Full-Stack Monorepo Platform",
    description: "Enterprise Monorepo Platform with Next.js 16, NestJS 11, Hexagonal Persistence, Zero-Shadow UI, and Argon2id IAM Security.",
};

export default async function RootLayout({
    children,
    params,
}: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}>) {
    const { locale } = await params;

    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    setRequestLocale(locale);
    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider>
                    <Providers>{children}</Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
