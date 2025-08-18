import React, { ButtonHTMLAttributes } from "react";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}
export const Button = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const variantStyles = {
    primary: "bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500",
    secondary:
      "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500",
    outline:
      "border border-gray-600 bg-transparent text-gray-300 hover:bg-gray-700 focus:ring-rose-500",
  };
  const sizeStyles = {
    sm: "text-xs px-2.5 py-1",
    md: "text-sm px-3.5 py-1.5",
    lg: "text-base px-5 py-2.5",
  };
  const widthStyles = fullWidth ? "w-full" : "";
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
