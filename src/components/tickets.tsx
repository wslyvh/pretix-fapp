"use client";

import {
  useConnect,
  useSendTransaction,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { WALLET_RECIPIENT } from "@/utils/config";
import { parseEther } from "viem/utils";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useFarcasterAccount } from "@/hooks/useFarcasterAccount";

interface Props {
  eventId: string;
  items: any[];
}

export function Tickets({ eventId, items }: Props) {
  const { isConnected, address } = useAccount();
  const { data: account } = useFarcasterAccount();
  const { connect, connectors } = useConnect();
  const { sendTransaction, isPending, data: hash } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  const [selectedItem, setSelectedItem] = useState(
    items?.length === 1 ? items[0] : null
  );
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState<any>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const ticket = localStorage.getItem("ticket");
    if (ticket) {
      setTicket(JSON.parse(ticket));
    }
  }, []);

  useEffect(() => {
    async function create() {
      await createOrder();
    }

    if (isConfirmed) {
      create();
    }
  }, [isConfirmed]);

  async function handleTransaction() {
    console.log("handleTransaction", selectedItem);

    try {
      sendTransaction({
        to: WALLET_RECIPIENT,
        value: parseEther((selectedItem.default_price / 100000).toFixed(18)),
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      setError("Transaction failed. Please try again.");
    }
  }

  async function createOrder() {
    console.log("Create Ticket Order", eventId, selectedItem.id, hash);

    const response = await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify({
        eventId,
        itemId: selectedItem.id,
        hash,
        displayName: account?.displayName ?? account?.username ?? address,
      }),
    });

    const data = await response.json();
    localStorage.setItem("ticket", JSON.stringify(data.ticket));
    setTicket(data.ticket);
    setError("");
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-bold">Tickets</h3>

      {!isConnected && (
        <div role="alert" className="alert mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info h-6 w-6 shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <div>Connect your wallet to buy tickets.</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect
          </button>
        </div>
      )}

      <div className="flex flex-col flex-grow gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-row items-center justify-between gap-2 py-2"
          >
            <div className="flex flex-col">
              <h3 className="text-lg">{item.name.en}</h3>
              <p className="text-sm text-base-content/60">
                ${item.default_price}
              </p>
            </div>

            <button
              className="btn btn-primary btn-xs sm:btn-wide"
              onClick={() => setSelectedItem(item)}
              disabled={!isConnected || selectedItem === item}
            >
              {selectedItem === item ? "Selected" : "Select"}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {error && (
          <div role="alert" className="alert alert-error alert-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold">Error</h3>
              <div className="text-xs text-base-content/60">{error}</div>
            </div>
          </div>
        )}

        {isConfirming && (
          <div role="alert" className="alert alert-info alert-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-info h-6 w-6 shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <p className="font-bold">Transaction sent. Confirming...</p>
            </div>
          </div>
        )}

        {isConfirmed && !ticket && (
          <div role="alert" className="alert alert-success alert-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <p className="font-bold">Confirmed. Creating ticket...</p>
            </div>
          </div>
        )}

        {ticket && (
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold items-center">Your ticket</h3>
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={ticket.code}
                size={256}
                className="rounded-2xl mt-4 mx-auto"
              />
              <span className="text-base-content/60 my-2">{ticket.code}</span>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {!ticket && (
            <button
              className="btn btn-primary btn-sm sm:btn-wide"
              onClick={handleTransaction}
              disabled={
                !isConnected ||
                !selectedItem ||
                isPending ||
                isConfirming ||
                isConfirmed
              }
            >
              {!selectedItem
                ? "Select a ticket"
                : isPending
                ? "Sending transaction..."
                : `Buy ${selectedItem?.name.en}`}
            </button>
          )}

          {ticket && (
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full"
              />
              <button
                className="btn btn-primary btn-full"
                disabled={!email || emailSent}
                onClick={async () => {
                  const response = await fetch(`/api/order`, {
                    method: "PUT",
                    body: JSON.stringify({
                      eventId,
                      code: ticket.code,
                      email: email,
                    }),
                  });

                  if (response.ok) {
                    setEmailSent(true);
                    setError("");
                  } else {
                    setEmailSent(false);
                    setError("Failed to send email. Please try again.");
                  }
                }}
              >
                {emailSent ? "Email sent" : "Send ticket"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
