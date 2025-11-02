import { useEffect } from "react";

interface KeyboardShortcutOptions {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
}

export function useKeyboardShortcut(
  options: KeyboardShortcutOptions,
  callback: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Guard against undefined key
      if (!event.key) return;
      
      const matchesKey = event.key.toLowerCase() === options.key.toLowerCase();
      const matchesCtrl = options.ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const matchesShift = options.shiftKey ? event.shiftKey : !event.shiftKey;
      const matchesAlt = options.altKey ? event.altKey : !event.altKey;
      const matchesMeta = options.metaKey ? event.metaKey : !event.metaKey;

      if (
        matchesKey &&
        matchesCtrl &&
        matchesShift &&
        matchesAlt &&
        matchesMeta
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, callback]);
}
