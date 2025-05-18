import dayjs from "dayjs";
import React from "react";

interface DateInfoCardProps {
  date_from: string | Date;
  date_to: string | Date;
  className?: string;
}

export function DateInfoCard({
  date_from,
  date_to,
  className = "",
}: DateInfoCardProps) {
  const start = dayjs(date_from);
  const end = dayjs(date_to);

  return (
    <div
      className={`card card-compact flex flex-row w-full items-center gap-4 p-2 bg-base-200 ${className}`}
    >
      <div className="flex flex-col items-center justify-center bg-base-100 rounded-xl">
        <span className="bg-primary text-primary-content text-xs font-semibold uppercase w-full text-center rounded-t-xl pt-1">
          {start.format("MMM")}
        </span>
        <span className="text-2xl font-bold text-base-content w-full text-center px-4">
          {start.format("D")}
        </span>
      </div>

      <div className="flex flex-col justify-center">
        <span className="text-base font-semibold text-base-content">
          {start.format("dddd, MMMM D")}
        </span>
        <span className="text-sm text-base-content/60">
          {start.format("h:mm A")} - {end.format("h:mm A")}
        </span>
      </div>
    </div>
  );
}
