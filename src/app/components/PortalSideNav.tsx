import * as React from "react";
import { MessageSquare, Globe, X } from "lucide-react";

export type ProductId = "pivot-prism" | "pluto";

interface NavItem {
  id: ProductId;
  label: string;
  icon: React.ReactNode;
  isComingSoon?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "pivot-prism",
    label: "Pivot Prism",
    icon: <MessageSquare size={18} />,
  },
  {
    id: "pluto",
    label: "Pluto",
    icon: <Globe size={18} />,
    isComingSoon: true,
  },
];

interface PortalSideNavProps {
  activeProduct: ProductId;
  onSelect: (id: ProductId) => void;
  onClose: () => void;
}

export function PortalSideNav({
  activeProduct,
  onSelect,
  onClose,
}: PortalSideNavProps) {
  return (
    <aside style={styles.nav}>
      {/* Nav items */}
      <nav style={styles.itemList}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.id === activeProduct;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
                ...(item.isComingSoon ? styles.navItemDisabled : {}),
              }}
              title={item.isComingSoon ? `${item.label} — Coming Soon` : item.label}
            >
              <span
                style={{
                  ...styles.icon,
                  ...(isActive ? styles.iconActive : {}),
                  ...(item.isComingSoon ? styles.iconDisabled : {}),
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  ...styles.label,
                  ...(isActive ? styles.labelActive : {}),
                  ...(item.isComingSoon ? styles.labelDisabled : {}),
                }}
              >
                {item.label}
              </span>
              {item.isComingSoon && (
                <span style={styles.badge}>Soon</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    width: 200,
    minWidth: 200,
    height: "100%",
    backgroundColor: "#ffffff",
    borderRight: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 16px 12px 16px",
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    color: "#9a9aae",
  },
  closeBtn: {
    background: "none",
    border: "none",
    padding: 4,
    cursor: "pointer",
    color: "#9a9aae",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s, color 0.15s",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginBottom: 8,
  },
  itemList: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    padding: "4px 8px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 10px",
    borderRadius: 8,
    border: "none",
    background: "none",
    cursor: "pointer",
    width: "100%",
    textAlign: "left",
    transition: "background 0.15s",
    position: "relative",
  },
  navItemActive: {
    backgroundColor: "rgba(82,73,210,0.08)",
  },
  navItemDisabled: {
    cursor: "default",
    opacity: 0.65,
  },
  icon: {
    color: "#717182",
    display: "flex",
    flexShrink: 0,
  },
  iconActive: {
    color: "#5249D2",
  },
  iconDisabled: {
    color: "#9a9aae",
  },
  label: {
    fontSize: 13.5,
    fontWeight: 500,
    color: "#3c3c4e",
    flex: 1,
  },
  labelActive: {
    color: "#5249D2",
    fontWeight: 600,
  },
  labelDisabled: {
    color: "#9a9aae",
  },
  badge: {
    fontSize: 10,
    fontWeight: 600,
    color: "#9a9aae",
    backgroundColor: "#ececf0",
    borderRadius: 4,
    padding: "1px 5px",
    letterSpacing: "0.02em",
  },
};
