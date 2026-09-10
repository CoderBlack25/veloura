import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merge Tailwind classes safely (later classes win instead of both applying).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
