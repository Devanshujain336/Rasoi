/**
 * use-mobile.js
 * 
 * @description General Javascript/React File.
 * @usage Used as a module within the application.
 */

import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
    const [isMobile, setIsMobile] = React.useState(undefined);

    React.useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        };
        mql.addEventListener("change", onChange);
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    return !!isMobile;
}
