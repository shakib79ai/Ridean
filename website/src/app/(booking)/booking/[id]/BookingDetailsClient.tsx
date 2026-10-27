"use client";

import { useState } from "react";
import Link from "next/link";
import { rUser, type Trip } from "@/data/booking-mock";

const STATUS_STYLE: Record<string, string> = {
  upcoming: "bg-info-bg text-info",
  completed: "bg-ok-bg text-ok",
  cancelled: "bg-ground text-muted",
};

export default function BookingDetailsClient({ trip }: { trip: Trip }) {
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      <div className="flex items-center justify-between">
        <div className="font-display text-[22px] font-extrabold text-navy">Booking details</div>
        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[cancelled ? "cancelled" : trip.status]}`}>
          {cancelled ? "cancelled" : trip.status}
        </span>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-5">
        <div>
          <div className="text-[11px] font-bold text-muted uppercase mb-1">Service</div>
          <div className="text-sm font-bold text-navy">{trip.mode} · {trip.date}, {trip.time}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1">Pickup</div>
            <div className="text-sm font-semibold text-navy">{trip.from}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1">Drop-off</div>
            <div className="text-sm font-semibold text-navy">{trip.to}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1">Rider</div>
            <div className="text-sm font-semibold text-navy">{rUser.name}</div>
            <div className="text-xs text-muted">{rUser.phone}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-muted uppercase mb-1">Vehicle & driver</div>
            <div className="text-sm font-semibold text-navy">{trip.car}</div>
            <div className="text-xs text-muted">{trip.driver ?? "Assigned 30 min before pickup"}</div>
          </div>
        </div>

        <div className="border-t border-line pt-4 flex justify-between">
          <span className="text-sm text-muted">Total fare</span>
          <span className="text-sm font-extrabold text-navy">{trip.price}</span>
        </div>
      </div>

      {trip.status === "upcoming" && !cancelled && (
        <div className="flex flex-col gap-3">
          {!cancelling ? (
            <div className="flex gap-3 flex-wrap">
              <Link href={`/booking/${trip.id}/edit`} className="flex-1 min-w-[140px] text-center bg-surface border border-line text-navy font-bold text-sm py-3 rounded-xl hover:bg-ground transition">
                Edit booking
              </Link>
              <button
                onClick={() => setCancelling(true)}
                className="flex-1 min-w-[140px] bg-surface border border-bad text-bad font-bold text-sm py-3 rounded-xl hover:bg-bad-bg transition"
              >
                Cancel booking
              </button>
              <Link href={`/booking/${trip.id}/contact-driver`} className="flex-1 min-w-[140px] text-center bg-navy text-white font-bold text-sm py-3 rounded-xl hover:brightness-110 transition">
                Contact driver
              </Link>
            </div>
          ) : (
            <div className="bg-bad-bg border border-bad/30 rounded-xl p-5 flex flex-col gap-3">
              <div className="text-sm font-bold text-navy">Cancel this booking?</div>
              <div className="text-xs text-muted">A cancellation fee of $5.00 may apply since pickup is within the hour.</div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setCancelled(true);
                    setCancelling(false);
                  }}
                  className="flex-1 bg-bad text-white font-bold text-sm py-2.5 rounded-xl"
                >
                  Confirm cancellation
                </button>
                <button onClick={() => setCancelling(false)} className="flex-1 border border-line text-navy font-bold text-sm py-2.5 rounded-xl">
                  Keep booking
                </button>
              </div>
            </div>
          )}
          <button className="text-sm font-bold text-navy-3 text-left">Need help? Contact support</button>
        </div>
      )}

      {cancelled && <div className="text-sm font-semibold text-bad">This booking has been cancelled.</div>}
    </div>
  );
}
