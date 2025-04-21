import ProfileCard from "@/components/ProfileCard";
import { Section } from "@/components/Section";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-6 bg-white min-h-screen">
      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg max-w-4xl w-full text-center">
        <ProfileCard />
        <Section title="О нас">
          <p className="text-gray-700 dark:text-gray-300">
            Добро пожаловать в Daukey App — место, где встречаются традиции и
            современные технологии. Мы создаем уникальное пространство для
            ценителей конного спорта.
          </p>
        </Section>
        <Section title="Наши лошади">
          <p className="text-gray-700 dark:text-gray-300">
            В нашем каталоге представлены лучшие лошади, отобранные с особым
            вниманием к качеству и происхождению.
          </p>
        </Section>
      </div>
    </main>
  );
}
