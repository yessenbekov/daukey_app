import { notFound } from "next/navigation";

const horses = [
  {
    id: 1,
    name: "Буцефал",
    image: "/horse1.jpg",
    description: "Легендарный боевой конь Александра Македонского.",
  },
  {
    id: 2,
    name: "Плотва",
    image: "/horse2.jpg",
    description: "Верный спутник Геральта из Ривии.",
  },
  {
    id: 3,
    name: "Таргет",
    image: "/horse3.jpg",
    description: "Быстроногий скакун для профессиональных скачек.",
  },
];

export default function HorseDetails({ params }: { params: { id: string } }) {
  const horse = horses.find((h) => h.id === Number(params.id));

  if (!horse) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">{horse.name}</h1>
      <img
        src={horse.image}
        alt={horse.name}
        className="w-96 h-64 object-cover rounded-lg shadow-md"
      />
      <p className="mt-4 text-lg text-gray-700">{horse.description}</p>
    </div>
  );
}
