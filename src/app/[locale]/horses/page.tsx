import Image from "next/image";

export function HorsesPage() {
  const horses = [
    {
      id: 1,
      name: "Асыл",
      image: "/horses/horse1.jpg",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
      id: 2,
      name: "Каратау",
      image: "/horses/horse2.jpg",
      video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
  ];

  return (
    <main className="flex flex-col items-center justify-center p-6 bg-white min-h-screen font-segoe">
      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-lg max-w-4xl w-full text-center font-segoe">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Наши лошади
        </h2>
        <div className="flex flex-col gap-6 mt-6">
          {horses.map((horse) => (
            <div
              key={horse.id}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md"
            >
              <Image
                src={horse.image}
                alt={horse.name}
                width={300}
                height={200}
                className="rounded-lg"
              />
              <h3 className="text-lg font-bold text-black dark:text-white mt-2">
                {horse.name}
              </h3>
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="200"
                  src={horse.video}
                  title={horse.name}
                  frameBorder="0"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default HorsesPage;
