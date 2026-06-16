"use client";

import { useState } from "react";

export default function CopyField({ value, mono = true }: { value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // Clipboard not available (e.g. insecure context) — ignore silently.
    }
  }

  return (
    <span className="cred">
      <span className={mono ? "mono" : undefined}>{value || "—"}</span>
      {value ? (
        <button className="copy-btn" onClick={copy} type="button">
          {copied ? "Copied" : "Copy"}
        </button>
      ) : null}
    </span>
  );
}
