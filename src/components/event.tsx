"use client";

import {
  useConnect,
  useSendTransaction,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { WALLET_RECIPIENT } from "@/utils/config";
import { parseEther, size } from "viem/utils";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { QRCodeSVG } from "qrcode.react";

interface Props {
  event: any;
  items: any[];
}

export function Event({ event, items }: Props) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const {
    sendTransaction,
    error,
    isPending,
    data: hash,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  const [itemId, setItemId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message);
    }
  }, [error]);

  useEffect(() => {
    async function create() {
      await createOrder();
    }

    if (isConfirmed) {
      create();
    }
  }, [isConfirmed]);

  async function handleTransaction(itemId: string) {
    console.log("handleTransaction", itemId);
    setItemId(itemId);
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      setErrorMessage("Item not found");
      return;
    }

    try {
      sendTransaction({
        to: WALLET_RECIPIENT,
        value: parseEther((item.default_price / 100000).toFixed(18)),
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrorMessage("Transaction failed. Please try again.");
    }
  }

  async function createOrder() {
    console.log("Create Ticket Order", event.slug, itemId, hash);

    const response = await fetch("/api/order", {
      method: "POST",
      body: JSON.stringify({ eventId: event.slug, itemId, hash }),
    });

    const data = await response.json();
    setTicket(data.ticket);
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-2xl font-bold">{event.name.en}</h2>

      <p className="text-sm text-base-content/60">
        {dayjs(event.date_from).format("DD/MM/YYYY")} -{" "}
        {dayjs(event.date_to).format("DD/MM/YYYY")}
      </p>

      <p className="text-sm text-base-content/80">{event.location.en}</p>

      <hr className="my-4" />

      {!isConnected && (
        <div role="alert" className="alert">
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
            <h3 className="font-bold">Not connected</h3>
            <div className="text-xs">Connect to a wallet to buy tickets.</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => connect({ connector: connectors[0] })}
          >
            Connect
          </button>
        </div>
      )}

      {isConnected && (
        <div role="alert" className="alert alert-soft">
          <span className="text-xs">
            Connected as{" "}
            <span className="font-bold">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
          </span>
        </div>
      )}

      <h3 className="text-xl font-bold">Tickets</h3>
      <div className="flex flex-col my-4 gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-row items-center justify-between gap-2"
          >
            <div className="flex flex-col">
              <h3 className="text-lg">{item.name.en}</h3>
              <p className="text-sm text-base-content/60">
                ${item.default_price}
              </p>
            </div>

            <button
              className="btn btn-primary btn-sm sm:btn-wide"
              onClick={() => handleTransaction(item.id)}
              disabled={!isConnected || isPending}
            >
              {isPending ? "Sending..." : "Buy"}
            </button>
          </div>
        ))}
      </div>

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
            <div className="text-xs text-base-content/60">{errorMessage}</div>
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
            <h3 className="font-bold">Transaction pending...</h3>
            {/* <div className="text-xs text-base-content/60">{hash}</div> */}
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
            <h3 className="font-bold">Transaction confirmed</h3>
            <div className="text-xs text-base-content/60" onClick={createOrder}>
              {hash?.slice(0, 8)}...{hash?.slice(-4)}
            </div>
          </div>
        </div>
      )}

      {ticket && (
        <div role="alert" className="alert alert-success alert-soft">
          <div className="flex flex-col">
            <div className="flex flex-row items-center gap-2">
              <h3 className="text-xl font-bold">Your ticket</h3>
              <span className="text-base-content/80">{ticket.code}</span>
            </div>
            <div className="flex flex-col items-center">
              <QRCodeSVG
                value={ticket.code}
                size={256}
                className="rounded-2xl mt-4 mx-auto"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
