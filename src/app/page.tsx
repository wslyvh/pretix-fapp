import { getEvents, getItems } from "@/clients/pretix";
import { Events } from "@/components/events";
import { Event } from "@/components/event";

export default async function Home() {
  const events = await getEvents();

  if (!events || events.length === 0) {
    return <div>No events found</div>;
  }

  if (events.length === 1) {
    const event = events[0];
    const items = await getItems(event.slug);
    return <Event event={event} items={items} />;
  }

  return <Events events={events} />;
}
