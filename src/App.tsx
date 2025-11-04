import React from 'react';
import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import router from './router';

function App() {
  // useRoutes 会根据路由配置返回需要渲染的元素
  const element = useRoutes(router);

  return (
    // 这个顶层 Suspense 用于加载 MainLayout 等一级路由
    <Suspense fallback={<div>Loading Layout...</div>}>
      {element}
    </Suspense>
  );
}

export default App;