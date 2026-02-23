import type { ComponentPropsWithoutRef, ElementType } from "react";

export type ElementProps<T extends ElementType> = ComponentPropsWithoutRef<T>;
export type JSX = React.JSX.Element | null;

export type HeaderLevels = 1 | 2 | 3 | 4 | 5 | 6;
