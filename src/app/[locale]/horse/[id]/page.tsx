import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { Horse } from "@/models";
import HorseDetailClient from "@/components/HorseDetailClient";
import InstallPrompt from "@/components/InstallPrompt";

type PageParams = { id: string; locale: string };

async function fetchHorse(id: string): Promise<Horse | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("horses")
    .select("*")
    .eq("id", id)
    .single();
  return data as Horse | null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { id } = await params;
  const horse = await fetchHorse(id);

  if (!horse) {
    return { title: "Daukey App" };
  }

  const description =
    horse.description?.slice(0, 160) ||
    [horse.breed?.trim(), horse.year ? `${horse.year} года` : null]
      .filter(Boolean)
      .join(" — ");

  return {
    title: `${horse.name} | Daukey App`,
    description,
    openGraph: {
      title: horse.name,
      description,
      images: horse.photos?.[0] ? [horse.photos[0]] : undefined,
    },
  };
}

export default async function HorseDetailsPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: "horseDetailsPage" });
  const horse = await fetchHorse(id);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 mt-15">
      <Link
        href={`/${locale}/horses`}
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← {t("backToList")}
      </Link>

      {!horse ? (
        <p className="p-4 text-red-500">{t("notFound")}</p>
      ) : (
        <HorseDetailClient horse={horse} />
      )}

      <InstallPrompt />
      <footer className="text-center text-xs text-black mt-8 pb-6">
        © {new Date().getFullYear()} | Developed by{" "}
        <a
          href="https://instagram.com/esenbekov.t"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-red-600"
        >
          Talgat Yessenbekov
        </a>
      </footer>
    </div>
  );
}
