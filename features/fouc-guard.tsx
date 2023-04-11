import { useMemo, useState } from "react";

export const FoucGuard = () => {
  const [allowTransitions, setAllowTransitions] = useState(false);

  // Run this once during render.
  useMemo(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("load", function () {
        setAllowTransitions(true);
      });
    }
  }, []);

  if (allowTransitions) {
    return null;
  }
  return (
    <></>
    // <style
    //   dangerouslySetInnerHTML={{
    //     __html: ` *, *::before, *::after { transition: none!important; } `,
    //   }}
    // />
  );
};
