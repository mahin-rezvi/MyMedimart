import Link from "next/link";
import { ArrowLeft, Clock3 } from "lucide-react";

interface ComingSoonPageProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}

export default function ComingSoonPage({
  title = "Coming soon",
  description = "This page is under construction. We are working on it and will be back shortly.",
  actionHref = "/",
  actionLabel = "Back to Home",
}: ComingSoonPageProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200/80 bg-white/95 dark:bg-slate-950 dark:border-slate-800 p-10 shadow-xl shadow-slate-900/5 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-600/10 text-brand-600">
          <Clock3 className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">{title}</h1>
        <p className="text-base text-slate-600 dark:text-slate-400 mb-8">{description}</p>
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <ArrowLeft className="w-4 h-4" />
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}
