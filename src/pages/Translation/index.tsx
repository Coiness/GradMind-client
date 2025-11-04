import React, { memo } from "react";
import type { FC, ReactNode } from "react";

interface IProps {
  children?: ReactNode;
}

const TranslationPage: FC<IProps> = () => {
  return <div>TranslationPage</div>;
};

export default memo(TranslationPage);
