import React from "react";

interface MenuIconProps {
  size?: number;
  color?: string;
}

const MenuIcon = ({ color, size }: MenuIconProps) => (
  <svg
    width={size || "24"}
    height={size || "25"}
    viewBox="0 0 24 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17 18.5H3"
      stroke={color || "black"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 14.5H3"
      stroke={color || "black"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 10.5H3"
      stroke={color || "black"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 6.5H3"
      stroke={color || "black"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default MenuIcon;
