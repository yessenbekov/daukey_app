"use client";

import React from "react";

function formatThousands(digits: string) {
  if (!digits) return "";
  return new Intl.NumberFormat("ru-RU").format(Number(digits));
}

export default function PriceInput({
  name,
  value,
  onChange,
  placeholder,
  required,
  className,
}: {
  name: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      name={name}
      placeholder={placeholder}
      required={required}
      className={className}
      value={formatThousands(value)}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "");
        onChange({
          target: { name, value: digits, type: "text" },
        } as unknown as React.ChangeEvent<HTMLInputElement>);
      }}
    />
  );
}
