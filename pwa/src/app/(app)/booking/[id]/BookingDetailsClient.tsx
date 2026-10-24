"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HeroHeader } from "@/components/HeroHeader";
import type { Trip } from "@/data/mock";
import { PencilIcon, ChatIcon } from "@/components/Icons";

const STATUS_STYLE = {
  upcoming: { bg: "bg-warn-bg", fg: "text-warn", label: "Upcoming" },
  completed: { bg: "bg-ok-bg", fg: "text-ok", label: "Completed" },
  cancelled: { bg: "bg-bad-bg", fg: "text-bad", label: "Cancelled" },
};

export default function BookingDetailsClient({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const status = cancelled ? "cancelled" : trip.status;
  const s = STATUS_STYLE[status];
  const canManage = status === "upcoming";

  return (
    <>
      <HeroHeader title="Booking details" subtitle={`${trip.mode} · ${trip.id.toUpperCase()}`} />
      <div className="flex-1 bg-surface rounded-t-[20px] -mt-3 px-5 pt-5 pb-6 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className={`${s.bg} ${s.fg} text-[11px] font-bold px-2.5 py-1 rounded-full`}>{s.label}</span>
          <span className="text-[12px] text-muted font-semibold">
            {trip.date} · {trip.time}
          </span>
        </div>

        <div className="border border-line rounded-[14px] p-3.5 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-ok" />
            <span className="text-[13.5px] font-semibold text-navy">{trip.from}</span>
          </div>
          <div className="h-px bg-line ml-1" />
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-sm bg-bad" />
            <span className="text-[13.5px] font-semibold text-navy">{trip.to}</span>
          </div>
        </div>

        <InfoRow label="Rider" value={trip.riderName ?? "—"} />
        <InfoRow label="Vehicle" value={trip.car} />
        <InfoRow
          label={trip.driver ? "Driver / Supplier" : "Driver"}
          value={trip.driver ?? "Will be assigned 30 min before pickup"}
        />

        <div className="bg-ground border border-line rounded-[14px] p-3.5 flex flex-col gap-1.5 mt-1">
          <div className="text-[12px] font-bold text-muted uppercase tracking-wide mb-1">Price breakdown</div>
          <Row label="Base fare" value={trip.baseFare ?? trip.price} />
          <Row label="Fees & taxes" value={trip.fees ?? "$0.00"} />
          <div className="h-px bg-line my-1" />
          <Row label="Total" value={trip.price} bold />
        </div>

        {canManage && (
          <div className="flex flex-col gap-2 mt-1">
            <ActionRow icon={PencilIcon} label="Edit booking" onClick={() => router.push(`/booking/${trip.id}/edit`)} />
            <ActionRow
              icon={ChatIcon}
              label="Contact driver / support"
              onClick={() => router.push(`/booking/${trip.id}/contact-driver`)}
            />
            {!confirmingCancel ? (
              <button
                onClick={() => setConfirmingCancel(true)}
                className="text-bad font-bold text-[14px] py-3 rounded-[12px] border border-bad/30"
              >
                Cancel booking
              </button>
            ) : (
              <div className="border border-bad/30 bg-bad-bg rounded-[14px] p-3.5 flex flex-col gap-2.5">
                <div className="text-[13px] text-navy font-semibold">
                  Cancelling less than 1 hour before pickup may include a $5.00 cancellation fee. Cancel this booking?
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirmingCancel(false)}
                    className="flex-1 border border-line rounded-[10px] py-2.5 text-[12.5px] font-bold text-navy bg-surface"
                  >
                    Keep booking
                  </button>
                  <button
                    onClick={() => {
                      setCancelled(true);
                      setConfirmingCancel(false);
                    }}
                    className="flex-1 bg-bad rounded-[10px] py-2.5 text-[12.5px] font-bold text-white"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button onClick={() => router.push("/trips")} className="text-center text-sm font-bold text-navy-3 mt-auto py-3">
          Back to trips
        </button>
      </div>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-2.5">
      <span className="text-[12.5px] text-muted font-semibold">{label}</span>
      <span className="text-[13px] text-navy font-bold text-right max-w-[220px]">{value}</span>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[12.5px] ${bold ? "font-bold text-navy" : "text-muted"}`}>{label}</span>
      <span className={`text-[13px] ${bold ? "font-extrabold text-navy" : "text-navy font-semibold"}`}>{value}</span>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  onClick,
}: {
  icon: (props: { className?: string }) => React.JSX.Element;
  label: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 border border-line rounded-[12px] p-3 text-left">
      <Icon className="w-[16px] h-[16px] text-navy" />
      <span className="flex-1 text-[13.5px] font-semibold text-navy">{label}</span>
      <span className="text-muted">›</span>
    </button>
  );
}
