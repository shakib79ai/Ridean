import Link from "next/link";

export default function LegalPrivacy() {
  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      <Link href="/profile" className="text-sm font-bold text-navy-3">← Profile</Link>
      <div className="font-display text-[22px] font-extrabold text-navy">Legal &amp; privacy</div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-3">
        <div className="text-base font-extrabold text-navy">Terms of Service</div>
        <p className="text-sm text-muted leading-relaxed">
          These Terms govern your use of the Ridean platform, operated by Best My Flight Inc. By requesting a ride,
          rental, or chauffeur booking through Ridean, you agree to pay the fare shown at the time of booking,
          including any applicable taxes, tolls, and supplier fees. Cancellations made within one hour of a scheduled
          pickup may incur a cancellation fee. Ridean connects riders with independent drivers and third-party rental
          and chauffeur suppliers; Ridean is not itself a transportation carrier. Accounts found to violate these
          Terms, including fraudulent payment activity or abuse of other users, may be suspended at Ridean&apos;s
          discretion.
        </p>
      </div>

      <div className="bg-surface border border-line rounded-2xl p-6 flex flex-col gap-3">
        <div className="text-base font-extrabold text-navy">Privacy Policy</div>
        <p className="text-sm text-muted leading-relaxed">
          Ridean collects the information you provide when creating an account (name, email, phone), the pickup and
          drop-off locations you enter for a booking, and payment details processed through our payment partners.
          This information is used to fulfil your bookings, provide customer support, and improve the service. We
          share trip details with the assigned driver or supplier only as needed to complete your booking, and we do
          not sell your personal information to third parties. You may request a copy of your data or ask us to
          delete your account at any time from Settings.
        </p>
      </div>
    </div>
  );
}
