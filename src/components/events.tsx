import dayjs from "dayjs";

interface Props {
  events: any[];
}

export function Events({ events }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold">Events</h2>
      <div className="flex flex-col gap-4 mt-4">
        {events?.map((event: any) => (
          <div key={event.slug}>
            <h3 className="text-lg font-bold">{event.name.en}</h3>
            <p className="text-sm text-gray-500">
              {dayjs(event.date_from).format("DD/MM/YYYY")} -{" "}
              {dayjs(event.date_to).format("DD/MM/YYYY")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
