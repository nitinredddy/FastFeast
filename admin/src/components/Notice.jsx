import React from "react";

const tones = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-slate-200 bg-slate-50 text-slate-700",
};

const Notice = ({ message, tone = "error" }) => {
  if (!message) return null;

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${tones[tone] || tones.info}`}>
      {message}
    </div>
  );
};

export default Notice;
