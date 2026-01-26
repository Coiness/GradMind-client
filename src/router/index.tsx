import { lazy } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";

// 导入布局和页面组件
const MainLayout = lazy(() => import("@/layouts/MainLayout"));
const VisualizationPage = lazy(() => import("@/pages/Visualization"));
const TranslationPage = lazy(() => import("@/pages/Translation"));
const OrchestrationPage = lazy(() => import("@/pages/Orchestration"));

const router: RouteObject[] = [
  {
    // 1. 创建一个父路由，它使用 MainLayout 作为布局
    path: "/",
    element: <MainLayout />,
    children: [
      {
        // 2. 当访问根路径'/'时，默认重定向到'visualization'
        index: true,
        element: <Navigate to="/visualization" replace />,
      },
      {
        // 3. 将页面路由作为子路由
        path: "visualization",
        element: <VisualizationPage />,
      },
      {
        path: "translation",
        element: <TranslationPage />,
      },
      {
        path: "orchestration",
        element: <OrchestrationPage />,
      },
    ],
  },
  // 你可以在这里添加其他不需要布局的顶层路由，比如登录页
  // {
  //   path: '/login',
  //   element: <LoginPage />
  // }
];

export default router;
