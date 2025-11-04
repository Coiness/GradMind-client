import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    // 应用范围
    files: ["**/*.{ts,tsx,js,mjs,cjs}"],

    // 继承预设规则集
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
      eslintConfigPrettier,
    ],
    languageOptions: {
      // 指定代码的 ECMAScript 版本
      ecmaVersion: 2020,
      // 声明代码运行在浏览器环境中，预定义‘window'，’document‘等全局变量
      globals: globals.browser,
    },
  },
]);
