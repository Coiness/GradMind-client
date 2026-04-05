import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import { Tabs, Switch } from "antd";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./MainLayout.module.css";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const items = [
    {
      key: "/visualization",
      label: "可视化交互",
    },
    {
      key: "/orchestration",
      label: "算法流编排",
    },
  ];

  const onTabChange = (key: string) => {
    navigate(key);
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.logo}>知几</div>
        <Tabs
          activeKey={location.pathname}
          items={items}
          onChange={onTabChange}
        />
        <div style={{ flex: 1 }} />
        <Switch
          checked={theme === "dark"}
          onChange={toggleTheme}
          checkedChildren="🌙"
          unCheckedChildren="☀️"
        />
      </header>
      <main className={styles.main}>
        <Suspense fallback={<div>Loading Page...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
