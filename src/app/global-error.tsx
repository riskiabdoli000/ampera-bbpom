"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AMPERA Global Error:", error);
  }, [error]);

  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            backgroundColor: "#ffffff",
            borderRadius: "20px",
            padding: "36px 28px",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
            border: "1px solid #e2e8f0",
            textAlign: "center",
          }}
        >
          {/* Badge Logo / BPOM Icon */}
          <div
            style={{
              width: "64px",
              height: "64px",
              margin: "0 auto 20px auto",
              borderRadius: "16px",
              backgroundColor: "#fff7ed",
              border: "1px solid #ffedd5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
            }}
          >
            ⚠️
          </div>

          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "4px 12px",
              borderRadius: "999px",
              backgroundColor: "#fee2e2",
              color: "#b91c1c",
              marginBottom: "12px",
            }}
          >
            Kendala Sistem Aplikasi
          </span>

          <h1
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#0f2257",
              margin: "0 0 10px 0",
              lineHeight: 1.3,
            }}
          >
            AMPERA BBPOM di Palembang
          </h1>

          <p
            style={{
              fontSize: "13px",
              color: "#64748b",
              lineHeight: 1.6,
              margin: "0 0 24px 0",
            }}
          >
            Terjadi kendala pada lapisan utama aplikasi. Silakan muat ulang halaman untuk mencoba kembali mengakses layanan.
          </p>

          {error?.digest && (
            <p
              style={{
                fontSize: "11px",
                fontFamily: "monospace",
                color: "#94a3b8",
                backgroundColor: "#f1f5f9",
                padding: "6px 12px",
                borderRadius: "8px",
                margin: "0 0 20px 0",
                display: "inline-block",
              }}
            >
              ID: {error.digest}
            </p>
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            <button
              onClick={() => reset()}
              type="button"
              style={{
                padding: "12px 24px",
                borderRadius: "999px",
                backgroundColor: "#ff8a1f",
                color: "#ffffff",
                border: "none",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(255, 138, 31, 0.3)",
              }}
            >
              Muat Ulang Halaman
            </button>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              type="button"
              style={{
                padding: "10px 20px",
                borderRadius: "999px",
                backgroundColor: "transparent",
                color: "#0f2257",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>

        <p
          style={{
            fontSize: "11px",
            color: "#94a3b8",
            marginTop: "24px",
          }}
        >
          © {new Date().getFullYear()} Balai Besar POM di Palembang
        </p>
      </body>
    </html>
  );
}

