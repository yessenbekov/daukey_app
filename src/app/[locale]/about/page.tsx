import ProfileCard from "@/components/ProfileCard";
import { Section } from "@/components/Section";
import { MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("homePage"); // Указываем namespace
  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen w-full bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/alone.jpeg')" }}
    >
      <div className="p-6 max-w-4xl w-full text-center">
        <ProfileCard />
        <Section title="О нас">
          <p className="text-white">
            Добро пожаловать в Daukey App — место, где встречаются традиции и
            современные технологии. Мы создаем уникальное пространство для
            ценителей конного спорта.
          </p>
        </Section>
        <Section title="Наши лошади">
          <p className="text-white">
            В нашем каталоге представлены лучшие лошади, отобранные с особым
            вниманием к качеству и происхождению.
          </p>
        </Section>
      </div>
    </main>
  );
}
