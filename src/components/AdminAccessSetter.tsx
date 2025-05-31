import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function AdminAccessSetter() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const adminParam = searchParams.get("adminAccessTrue");
    if (adminParam === "1") {
      localStorage.setItem("isAdminDaukey", "true");
    }
  }, [searchParams]);

  return null;
}
