import { twMerge } from "tailwind-merge";

type ClassValue = unknown;

function clsx(...args: unknown[]): string {
  const res: string[] = [];
  args.forEach((arg) => {
    if (!arg) return;
    if (typeof arg === "string" || typeof arg === "number") {
      res.push(String(arg));
    } else if (Array.isArray(arg)) {
      res.push(clsx(...(arg as unknown[])));
    } else if (typeof arg === "object" && arg !== null) {
      const obj = arg as Record<string, unknown>;
      Object.keys(obj).forEach((k) => {
        if (obj[k]) res.push(k);
      });
    }
  });
  return res.join(" ");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...(inputs as unknown[])));
}
