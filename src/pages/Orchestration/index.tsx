import React, { memo } from "react";
import type { FC, ReactNode } from "react";

interface IProps {
  children?: ReactNode;
}

const OrchestrationPage: FC<IProps> = () => {
  return <div>OrchestrationPage</div>;
};

export default memo(OrchestrationPage);
