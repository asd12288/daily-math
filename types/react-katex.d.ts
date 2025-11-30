declare module "react-katex" {
  import { ComponentType, ReactNode } from "react";

  interface KatexProps {
    math: string;
    children?: ReactNode;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
  }

  export const InlineMath: ComponentType<KatexProps>;
  export const BlockMath: ComponentType<KatexProps>;
}
