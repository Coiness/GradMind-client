# GradMind Client

一个用于可视化《人工智能数学基础》核心概念的交互式 Web 应用。通过动态参数调整和实时计算，帮助学习者直观理解梯度下降、反向传播等算法。

## 技术栈

- 前端框架: React 18 + TypeScript
- 构建工具: Vite
- UI 库: Ant Design
- 状态管理: Redux Toolkit
- 样式: CSS Modules (保持一致性)
- 代码规范: ESLint + Prettier

## 快速开始

环境要求

- Node.js >= 20.19.0 (推荐使用 LTS 版本)
- npm 或 yarn

安装依赖
`npm install`

启动开发服务器
`npm run dev`

打开浏览器访问 `http://localhost:5173`，即可看到应用运行。

构建生产化版本
`npm run build`

代码格式化
`npm run format`

代码检查
`npm run lint`

## 项目结构

```
src/
├── assets/              # 静态资源文件 (图片、图标等)
├── components/          # 通用可复用组件
│   ├── InfoPanel/       # 信息展示面板
│   │   ├── index.module.css
│   │   └── index.tsx
│   └── ParameterPanel/  # 参数配置面板
├── config/              # 应用配置
│   └── scenarios/       # 场景配置文件
│       ├── gradientDescentScenario.ts  # 梯度下降场景
│       └── index.ts     # 场景导出
├── layouts/             # 页面布局组件
├── pages/               # 页面组件
│   ├── Orchestration/   # 编排页面
│   ├── Translation/     # 翻译页面
│   └── Visualization/   # 可视化页面
│       └── index.tsx
├── router/              # 路由配置
│   └── index.tsx
├── store/               # Redux 状态管理
│   └── features/        # Redux slices
│       ├── hooks.ts     # Redux hooks
│       ├── index.ts     # Store 配置
│       └── visualizationSlice.ts  # 可视化 slice
├── style/               # 全局样式
│   └── global.less
└── types/               # TypeScript 类型定义
    ├── computationResult.ts  # 计算结果类型
    ├── index.ts         # 类型导出
    ├── InfoConfig.ts    # 信息面板类型
    └── parameterConfig.ts  # 参数配置类型
```

## 开发规范

### 1. 新增组件的要求

- 位置: 所有通用组件放在 `components` 下，每个组件一个文件夹。
- 文件结构:
  - `index.tsx`: 组件主文件
  - `index.module.css`: 组件样式 (使用 CSS Modules)
- 风格一致性:
  - 使用 Ant Design 组件作为基础。
  - 容器样式统一: `padding: 16px; border: 1px solid #f0f0f0; border-radius: 8px; background-color: #fff;`
  - 布局使用 `Space` 组件垂直堆叠。
  - 避免内联样式，优先使用 CSS Modules。
- 命名: PascalCase (如 `ParameterPanel`)。
- Props: 使用 TypeScript 接口定义，必需属性在前，可选属性在后。
- 示例:

```tsx
// src/components/NewComponent/index.tsx
import styles from "./index.module.css";

interface NewComponentProps {
  title: string;
  data: any[];
  loading?: boolean;
}

export const NewComponent: React.FC<NewComponentProps> = () => {
  return <div className={styles.panel}>{/* 组件内容 */}</div>;
};
```

### 2. Store (Redux) 使用规范

- 位置: 所有 Redux 相关代码放在 `store` 下。
- Slice 结构: 使用 Redux Toolkit 的 `createSlice`，每个功能一个 slice。
- 异步操作: 使用 `createAsyncThunk` 处理异步逻辑。
- 状态类型: 在 slice 文件中定义 `State` 接口。
- 命名: slice 文件使用 camelCase (如 `visualizationSlice.ts`)。
- 示例:

```ts
// src/store/features/newFeatureSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface NewFeatureState {
  data: any;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

export const fetchData = createAsyncThunk('newFeature/fetchData', async () => {
  // 异步逻辑
});

const newFeatureSlice = createSlice({
  name: 'newFeature',
  initialState: { ... } as NewFeatureState,
  reducers: { /* 同步 reducers */ },
  extraReducers: (builder) => {
    builder.addCase(fetchData.pending, (state) => {
      // ...
    });
    // ...
  },
});
```

### 3. Type (TypeScript 类型) 定义规范

- 位置: 所有类型定义放在 `types` 下，每个类型一个文件。
- 命名: 文件名使用 camelCase (如 `parameterConfig.ts`)，类型名使用 PascalCase (如 `ParameterConfig`)。
- 组织: 相关类型放在同一个文件，避免过度拆分。
- 导入: 使用 `import type` 语法。
- 示例:

```ts
// src/types/newType.ts
export interface NewType {
  id: string;
  name: string;
  value?: number;
}

export type NewUnionType = "option1" | "option2";
```

## 贡献指南

1. Fork 本仓库。
2. 创建功能分支: `git checkout -b feature/new-feature`。
3. 代码检查: `npm lint`.
4. 代码格式化: `npm run format`.
5. 将代码加入缓冲区: `git add .`
6. 提交更改: `git commit -m "feat: add new feature"`。
7. 推送分支: `git push origin feature/new-feature`。
8. 创建 Pull Request。（github网页可以）

## 补充

我使用 scenarios 类型存放不同场景的一些信息，像是参数、展示信息、计算结果等，可以在 config 里面通过新建文件来配置不同的场景。
