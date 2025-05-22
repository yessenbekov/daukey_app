interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <section className="my-8 p-6 backdrop-blur-md rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-4 text-black text-white">
        {title}
      </h2>
      <div className="text-black dark:text-gray-300">{children}</div>
    </section>
  );
}
