import { Tickets } from "./tickets";
import dayjs from "dayjs";

interface Props {
  event: any;
  items: any[];
}

export function Event({ event, items }: Props) {
  const [locationName, ...locationDescription] = event.location.en.split(",");
  const location = locationDescription.join(",").trim();

  return (
    <div className="flex flex-col h-full gap-2">
      <h2 className="text-2xl font-bold">{event.name.en}</h2>

      <div className="flex flex-col sm:flex-row gap-4 my-4">
        {/* Calendar Info */}
        <div className="flex flex-row w-full items-center gap-4">
          <div className="flex flex-col w-14 h-14 items-center justify-center bg-base-100 rounded-xl shadow-md">
            <span className="bg-primary text-primary-content text-xs font-semibold uppercase w-full text-center rounded-t-xl pt-1">
              {dayjs(event.date_from).format("MMM")}
            </span>
            <span className="text-2xl font-bold text-base-content w-full text-center px-4">
              {dayjs(event.date_from).format("D")}
            </span>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-base font-semibold text-base-content">
              {dayjs(event.date_from).format("dddd, MMMM D")}
            </span>
            <span className="text-sm text-base-content/60">
              {dayjs(event.date_from).format("h:mm A")} -{" "}
              {dayjs(event.date_to).format("h:mm A")}
            </span>
          </div>
        </div>

        {/* Location Info */}
        <div className="flex flex-row w-full items-center gap-4">
          <div className="flex flex-col w-14 h-14 items-center justify-center p-1 bg-base-100 rounded-xl shadow-md">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M12,14 C9.790861,14 8,12.209139 8,10 C8,7.790861 9.790861,6 12,6 C14.209139,6 16,7.790861 16,10 C16,12.209139 14.209139,14 12,14 Z M12,13 C13.6568542,13 15,11.6568542 15,10 C15,8.34314575 13.6568542,7 12,7 C10.3431458,7 9,8.34314575 9,10 C9,11.6568542 10.3431458,13 12,13 Z M12.3391401,20.8674017 C12.1476092,21.0441994 11.8523908,21.0441994 11.6608599,20.8674017 C7.23483091,16.7818365 5,13.171725 5,10 C5,6.13400675 8.13400675,3 12,3 C15.8659932,3 19,6.13400675 19,10 C19,13.171725 16.7651691,16.7818365 12.3391401,20.8674017 Z M18,10 C18,6.6862915 15.3137085,4 12,4 C8.6862915,4 6,6.6862915 6,10 C6,12.7518356 7.98660341,16.0353377 12,19.8163638 C16.0133966,16.0353377 18,12.7518356 18,10 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="flex flex-col justify-center">
            <span className="flex items-center text-base font-semibold text-base-content">
              {locationName}
              <a
                href={`https://www.google.com/maps/search/${encodeURIComponent(
                  location
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 align-middle"
              >
                <svg
                  width="14"
                  height="14"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="inline text-base-content/60"
                >
                  <path
                    d="M14 3h7v7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 14L21 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </span>
            {location && (
              <span className="text-sm text-base-content/60">{location}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tickets */}
      <Tickets eventId={event.slug} items={items} />
    </div>
  );
}
