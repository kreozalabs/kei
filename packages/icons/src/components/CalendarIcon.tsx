import * as React from "react";
import type { SVGProps } from "react";
export interface CalendarIconProps extends SVGProps<SVGSVGElement> {
  day?: number | string;
}
export const CalendarIcon = ({ day = 31, ...props }: CalendarIconProps) => <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="none" viewBox="0 0 192 192" {...props}><path fill="#ff693c" d="M19.867 49.392C17.818 33.82 29.94 20 45.645 20h100.71c15.706 0 27.827 13.82 25.778 29.392L166 96l6.133 46.608C174.182 158.18 162.061 172 146.355 172H45.645c-15.706 0-27.827-13.82-25.778-29.392L26 96z" /><text x={96} y={112} fill="#fff" fontSize={84} fontWeight={800} fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle" dominantBaseline="middle">{day}</text></svg>;
