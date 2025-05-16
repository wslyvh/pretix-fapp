import {
  createOrder,
  getEvent,
  getEvents,
  getItems,
  getTicketData,
  getTicketPdf,
} from "@/clients/pretix";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import dayjs from "dayjs";

dotenv.config();

async function main() {
  console.log("Running Pretix API integration...");

  try {
    console.log("Getting events...");
    const events = await getEvents();
    const pastEvents = await getEvents({ is_past: false });
    const futureEvents = await getEvents({ is_future: true });
    const liveEvents = await getEvents({ is_public: true });
    console.log(
      `Event stats: ${events.length} all, ${pastEvents.length} past, ${futureEvents.length} future, ${liveEvents.length} live`
    );
    events.map((e: any) => console.log(`- ${e.name.en} (${e.slug})`));

    if (events.length === 0) {
      console.error("No events found..");
      return;
    }

    console.log();
    console.log(`Getting event info for "${events[0].slug}"...`);
    const event = await getEvent(events[0].slug);

    console.log(
      `${event.name.en}, ${event.location.en} (${dayjs(event.date_from).format(
        "DD MMM YYYY"
      )} - ${dayjs(event.date_to).format("DD MMM YYYY")})`
    );

    if (!event) {
      console.log("Event not found");
      return;
    }

    console.log();
    console.log("Getting items...");
    const items = await getItems(event.slug);
    items.map((i: any) => console.log(`- ${i.name.en} $${i.default_price}`));

    if (items.length === 0) {
      console.error("No items found..");
      return;
    }

    console.log();
    console.log("Create order...");
    const order = await createOrder(event.slug, items[0].id);
    console.log(`Order created: ${order.code}`);

    console.log();
    const orderCode = order.code; // X0PKM
    console.log("Get ticket data...");
    const ticketData = await getTicketData(event.slug, orderCode);
    console.log(ticketData);

    console.log("Save ticket PDF to downloads...");
    await saveTicketToDownloads(event.slug, orderCode);
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function saveTicketToDownloads(
  eventId: string,
  orderCode: string
) {
  const qrCode = await getTicketPdf(eventId, orderCode);
  const downloadsPath = path.join(os.homedir(), "Downloads");
  const fileName = `ticket-${orderCode}.pdf`;
  const filePath = path.join(downloadsPath, fileName);

  fs.writeFileSync(filePath, Buffer.from(qrCode));
  console.log(`Ticket saved to: ${filePath}`);
  return filePath;
}

main()
  .then(() => {
    console.log("Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
