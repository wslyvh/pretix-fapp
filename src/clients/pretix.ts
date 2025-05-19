import { TEST_MODE } from "@/utils/config";
import { retry } from "@/utils/retry";
export interface PretixConfig {
  baseUrl: string;
  apiUrl: string;
  token: string;
  organizer: string;
}

let config: PretixConfig | null = null;

export function initConfig(): PretixConfig {
  if (!config) {
    const baseUrl = process.env.PRETIX_BASE_URL || "https://pretix.eu";
    const token = process.env.PRETIX_API_TOKEN || "";
    const organizer = process.env.PRETIX_ORGANIZER || "";

    config = {
      baseUrl,
      apiUrl: `${baseUrl}/api/v1`,
      token,
      organizer,
    };

    console.log("Pretix Config:", {
      baseUrl,
      token: token ? "***" : "missing",
      organizer,
    });

    if (!config.token) {
      throw new Error("Pretix API token is not set");
    }

    if (!config.organizer) {
      throw new Error("Pretix organizer is not set");
    }
  }

  return config;
}

export function headers() {
  const config = initConfig();
  return {
    Authorization: `Token ${config.token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function buildQueryUrl(
  baseUrl: string,
  params?: Record<string, string | number | boolean>
) {
  let url = baseUrl;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  return url;
}

export async function getEvents(
  queryParams?: Record<string, string | number | boolean>
) {
  const config = initConfig();
  const baseUrl = `${config.apiUrl}/organizers/${config.organizer}/events`;
  const url = buildQueryUrl(baseUrl, queryParams);

  const response = await fetch(url, {
    headers: headers(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch event: ${response.status}, body: ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.results;
}

export async function getEvent(
  eventId: string,
  queryParams?: Record<string, string | number | boolean>
) {
  const config = initConfig();
  const baseUrl = `${config.apiUrl}/organizers/${config.organizer}/events/${eventId}/`;
  const url = buildQueryUrl(baseUrl, queryParams);

  const response = await fetch(url, {
    headers: headers(),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch event: ${response.status}, body: ${response.statusText}`
    );
  }

  return response.json();
}

export async function getItems(
  eventId: string,
  queryParams?: Record<string, string | number | boolean>
) {
  const config = initConfig();
  const baseUrl = `${config.apiUrl}/organizers/${config.organizer}/events/${eventId}/items`;
  const url = buildQueryUrl(baseUrl, queryParams);

  const response = await fetch(url, {
    headers: headers(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch items: ${response.status}, body: ${errorText}`
    );
  }

  const data = await response.json();
  return data.results;
}

export async function createOrder(
  eventId: string,
  itemId: number,
  address?: string,
  displayName?: string,
  queryParams?: Record<string, string | number | boolean>
) {
  const config = initConfig();
  const baseUrl = `${config.apiUrl}/organizers/${config.organizer}/events/${eventId}/orders/`;
  const url = buildQueryUrl(baseUrl, queryParams);
  console.log("createOrder", url);

  const response = await fetch(url, {
    headers: headers(),
    method: "POST",
    body: JSON.stringify({
      // email: '', //  updated after purchase
      locale: "en",
      status: "p", // 'p' = paid, 'n' = pending
      testmode: TEST_MODE,
      payment_provider: "manual",
      positions: [
        {
          item: itemId,
          attendee_name: displayName,
        },
      ],
      invoice_address: {
        name: address,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create order: ${response.status}, body: ${errorText}`
    );
  }

  return response.json();
}

export async function updateOrder(
  eventId: string,
  orderCode: string,
  data: Record<string, string | number | boolean>,
  queryParams?: Record<string, string | number | boolean>
) {
  console.log("updateOrder", eventId, orderCode, data);
  const config = initConfig();
  const baseUrl = `${config.apiUrl}/organizers/${config.organizer}/events/${eventId}/orders/${orderCode}/`;
  const url = buildQueryUrl(baseUrl, queryParams);

  const response = await fetch(url, {
    headers: headers(),
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update order: ${response.status}, body: ${errorText}`
    );
  }

  return response.json();
}

export async function getTicketPdf(
  eventId: string,
  orderCode: string,
  queryParams?: Record<string, string | number | boolean>
) {
  const config = initConfig();
  const baseUrl = `${config.apiUrl}/organizers/${config.organizer}/events/${eventId}/orders/${orderCode}/download/pdf`;
  const url = buildQueryUrl(baseUrl, queryParams);

  return retry(
    async () => {
      const response = await fetch(url, {
        headers: headers(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to fetch ticket PDF: ${response.status}, body: ${errorText}`
        );
      }

      return response.arrayBuffer();
    },
    3, // max attempts
    5000 // delay between attempts
  );
}

export async function getTicketData(eventId: string, orderCode: string) {
  const config = initConfig();
  const url = `${config.apiUrl}/organizers/${config.organizer}/events/${eventId}/orders/${orderCode}/`;

  const response = await fetch(url, {
    headers: headers(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch ticket data: ${response.status}, body: ${errorText}`
    );
  }

  const order = await response.json();

  return {
    secret: order.secret,
    code: order.code,
    tickets: order.positions.map((pos: any) => ({
      id: pos.id,
      secret: pos.secret,
      item: pos.item,
      attendee_name: pos.attendee_name,
    })),
  };
}
