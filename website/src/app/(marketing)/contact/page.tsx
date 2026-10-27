export default function Contact() {
  return (
    <section className="px-8 md:px-16 py-16 flex flex-col md:flex-row gap-14">
      <div className="flex-1">
        <div className="text-[13px] font-extrabold text-acc tracking-wide mb-2.5">
          CONTACT &amp; SUPPORT
        </div>
        <h1 className="font-display text-[34px] font-extrabold text-navy mb-4">
          We&apos;re here to help.
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-7 max-w-[420px]">
          Reach the support team, report a trip issue, or ask about
          partnering with Ridean.
        </p>

        <div className="flex flex-col gap-4">
          <ContactRow icon="💬" bg="#E8EEF8" title="Live chat" desc="Available 24/7 in the app & on this site" />
          <ContactRow icon="✉️" bg="#DDF3E8" title="support@ridean.com" desc="General support & trip issues" />
          <ContactRow icon="🤝" bg="#FBEBCF" title="partners@ridean.com" desc="Supplier & business partnerships" />
        </div>
      </div>

      <form className="flex-1 bg-ground border border-line rounded-[20px] p-8 flex flex-col gap-3.5 max-w-[460px]">
        <div className="text-base font-extrabold text-navy mb-1">
          Send us a message
        </div>
        <Field label="Name" placeholder="Your full name" />
        <Field label="Email" placeholder="you@example.com" type="email" />
        <Field label="Topic" placeholder="Trip issue" />
        <div>
          <div className="text-[11px] font-bold text-muted uppercase mb-1.5">
            Message
          </div>
          <textarea
            placeholder="Tell us what happened…"
            className="w-full bg-surface border border-line rounded-[10px] px-3.5 py-3 text-[13.5px] text-navy placeholder:text-muted-on-dark min-h-[70px] outline-none focus:border-navy-3"
          />
        </div>
        <button
          type="submit"
          className="bg-acc text-navy font-extrabold text-sm py-3.5 rounded-[10px] mt-1 hover:brightness-95 transition"
        >
          Send message
        </button>
      </form>
    </section>
  );
}

function ContactRow({ icon, bg, title, desc }: { icon: string; bg: string; title: string; desc: string }) {
  return (
    <div className="flex gap-3.5 items-start">
      <div
        className="w-10 h-10 rounded-[10px] flex items-center justify-center text-base"
        style={{ background: bg }}
      >
        {icon}
      </div>
      <div>
        <div className="text-sm font-bold text-navy">{title}</div>
        <div className="text-[12.5px] text-muted">{desc}</div>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold text-muted uppercase mb-1.5">
        {label}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-surface border border-line rounded-[10px] px-3.5 py-3 text-[13.5px] text-navy placeholder:text-muted-on-dark outline-none focus:border-navy-3"
      />
    </div>
  );
}
