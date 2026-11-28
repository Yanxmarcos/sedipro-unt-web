"use client";

import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import styles from "./campaign.module.css";

export default function CampaignHeader({ desktopLogo, mobileLogo, children }) {
  const header = useRef(null);
  const toggle = useRef(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = header.current;
    const campaign = element.parentElement;
    const measure = () => campaign.style.setProperty("--navi-header-height", `${element.offsetHeight}px`);
    const observer = new ResizeObserver(measure);
    measure();
    observer.observe(element);
    function updateBackground() {
      element.toggleAttribute("data-scrolled", window.scrollY > 0);
    }
    updateBackground();
    window.addEventListener("scroll", updateBackground, { passive: true });
    return () => {
      observer.disconnect();
      campaign.style.removeProperty("--navi-header-height");
      window.removeEventListener("scroll", updateBackground);
    };
  }, []);

  return (
    <header ref={header} className={styles.header} onKeyDown={(event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current.focus();
      }
    }}>
      <div className={styles.desktopLogo}>{desktopLogo}</div>
      <div className={styles.mobileLogo}>{mobileLogo}</div>
      <button ref={toggle} type="button" className={styles.menuToggle}
        aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open}
        aria-controls="navi-header-links" onClick={() => setOpen(!open)}>
        {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
      <div id="navi-header-links" className={styles.headerLinks} data-open={open}
        onClick={(event) => { if (event.target.closest("a")) setOpen(false); }}>
        {children}
      </div>
    </header>
  );
}
