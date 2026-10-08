// A tiny in-memory stand-in for next/navigation, so tests can follow route changes.
import { useSyncExternalStore } from "react";

let pathname = "/";
const listeners = new Set();

function navigate(next) {
  pathname = next;
  listeners.forEach((listener) => listener());
}

const router = {
  push: navigate,
  replace: navigate,
  back: () => {},
  prefetch: () => {},
};

export function setPathname(next) {
  navigate(next);
}

export function currentPathname() {
  return pathname;
}

export function usePathname() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => pathname,
    () => pathname,
  );
}

export function useRouter() {
  return router;
}
