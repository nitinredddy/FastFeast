import React from "react";
import { Link } from "react-router-dom";

const AccessDenied = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-slate-100 px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-500">
          Access denied
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">This page is not available for your role.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Staff and admin permissions differ across the panel. If you signed in with the wrong
          account, go back to login and use an authorized one.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Go to dashboard
          </Link>
          <Link
            to="/login"
            className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
