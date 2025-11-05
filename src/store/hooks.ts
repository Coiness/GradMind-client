import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// 在整个应用程序中使用，而不是普通的 `useDispatch` 和 `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
