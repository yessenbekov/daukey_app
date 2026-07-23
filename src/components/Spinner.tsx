export default function Spinner({
  className = "",
  label,
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-10 ${className}`}>
      <div className="h-8 w-8 rounded-full border-2 border-gray-300 border-t-black animate-spin" />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
