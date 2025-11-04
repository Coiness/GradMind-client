import { Outlet, NavLink } from "react-router-dom";
import { Suspense } from "react";

export default function MainLayout() {
  return (
    <div>
      <header>
        {/* 这里是你的导航栏 */}
        <nav
          style={{
            display: "flex",
            gap: "20px",
            padding: "20px",
            borderBottom: "1px solid #eee",
          }}
        >
          <h2>知几</h2>
          <NavLink to="/visualization">可视化交互</NavLink>
          <NavLink to="/translation">公式-算法对译</NavLink>
          <NavLink to="/orchestration">算法流编排</NavLink>
        </nav>
      </header>
      <main>
        {/* 
          子路由组件会在这里渲染。
          因为子路由也是懒加载的，所以这里也需要一个 Suspense。
        */}
        <Suspense fallback={<div>Loading Page...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
