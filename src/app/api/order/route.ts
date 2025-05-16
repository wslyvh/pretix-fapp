import { createPublicClient, http } from "viem";
import { createOrder, getTicketData } from "@/clients/pretix";
import { config } from "@/utils/wagmi";
import { WALLET_RECIPIENT } from "@/utils/config";

const client = createPublicClient({
  chain: config.chains[0],
  transport: http(),
});

export async function POST(req: Request) {
  try {
    const { eventId, itemId, hash } = await req.json();
    console.log("[POST] Create Order", eventId, itemId, hash);

    if (!eventId || !itemId || !hash) {
      console.error("Missing required parameters", eventId, itemId, hash);
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const tx = await client.getTransaction({ hash });

    if (!tx) {
      return new Response(JSON.stringify({ error: "Transaction not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (tx.to?.toLowerCase() !== WALLET_RECIPIENT.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: "Invalid recipient address" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const senderAddress = tx.from;

    // Additional verification:
    // 1. Check if the sender already has an order for this event
    // 2. Verify the transaction amount matches the ticket price
    // 3. Check if the transaction is x confirmations

    const order = await createOrder(eventId, itemId, senderAddress);
    const ticket = await getTicketData(eventId, order.code);

    return new Response(JSON.stringify({ order, ticket }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing order:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process order",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
