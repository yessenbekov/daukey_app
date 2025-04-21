import Image from "next/image";

const ProfileCard = () => {
  return (
    <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md text-center">
      <Image
        src="/images/daniyar-daukey.jpg"
        alt="Данияр Даукей"
        width={150}
        height={150}
        className="mx-auto rounded-full border-4 border-black dark:border-white"
      />
      <h2 className="text-2xl font-bold mt-4 text-black dark:text-white">
        Данияр Даукей
      </h2>
      <p className="text-lg text-gray-700 dark:text-gray-300">
        Опытный коневод, основатель кокпар клуба "Даукей Кокпар Клуб" и лиги
        "Жастар Кокпар Лигасы".
      </p>
    </div>
  );
};

export default ProfileCard;
