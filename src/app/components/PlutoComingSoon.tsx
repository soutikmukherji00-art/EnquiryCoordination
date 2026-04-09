import * as React from "react";

export function PlutoComingSoon() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f4ff 0%, #edf0ff 100%)",
        fontFamily: "inherit",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: "rgba(82,73,210,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          marginBottom: 20,
        }}
      >
        🪐
      </div>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#25282d",
          margin: 0,
          marginBottom: 8,
        }}
      >
        Pluto
      </h2>
      <p
        style={{
          fontSize: 14,
          color: "#717182",
          margin: 0,
          maxWidth: 280,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        This product is on its way. Check back soon!
      </p>
      <div
        style={{
          marginTop: 24,
          padding: "8px 20px",
          border: "1.5px solid rgba(82,73,210,0.25)",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
          color: "#5249D2",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        Coming Soon
      </div>
    </div>
  );
}
