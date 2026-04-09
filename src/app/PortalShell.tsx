import * as React from "react";
import { useState } from "react";
import { Menu } from "lucide-react";
import { PortalSideNav, type ProductId } from "./components/PortalSideNav";
import { AppProviders } from "./AppProviders";
import { AppContent } from "./App";

// ---------------------------------------------------------------------------
// Pluto "Coming Soon" placeholder
// ---------------------------------------------------------------------------
function PlutoComingSoon() {
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

// ---------------------------------------------------------------------------
// Portal Shell — top-level wrapper with side nav
// ---------------------------------------------------------------------------
export function PortalShell() {
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [activeProduct, setActiveProduct] = useState<ProductId>("pivot-prism");

  const handleSelect = (id: ProductId) => {
    // Pluto is coming soon — don't navigate
    if (id === "pluto") return;
    setActiveProduct(id);
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Animated side nav */}
      <div
        style={{
          width: isNavOpen ? 200 : 0,
          minWidth: 0,
          overflow: "hidden",
          transition: "width 0.22s cubic-bezier(0.4, 0, 0.2, 1)",
          flexShrink: 0,
          height: "100%",
        }}
      >
        <PortalSideNav
          activeProduct={activeProduct}
          onSelect={handleSelect}
          onClose={() => setIsNavOpen(false)}
        />
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, minWidth: 0, height: "100%", overflow: "hidden" }}>
        {activeProduct === "pivot-prism" ? (
          <AppProviders>
            <AppContent onToggleSideNav={() => setIsNavOpen(!isNavOpen)} />
          </AppProviders>
        ) : (
          <PlutoComingSoon />
        )}
      </div>
    </div>
  );
}
