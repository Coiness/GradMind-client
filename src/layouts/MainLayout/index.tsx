import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Suspense } from "react";
import { Tabs } from "antd";
import styles from "./MainLayout.module.css";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    {
      key: "/visualization",
      label: "可视化交互",
    },
    {
      key: "/translation",
      label: "公式-算法对译",
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
    <div>
      {/* 2. 使用 className 替换 style */}
      <header className={styles.header}>
        <div className={styles.logo}>知几</div>
        <Tabs
          activeKey={location.pathname}
          items={items}
          onChange={onTabChange}
        />
      </header>
      <main>
        <Suspense fallback={<div>Loading Page...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
