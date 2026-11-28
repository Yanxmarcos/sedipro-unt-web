import Image from "next/image";
import Link from "next/link";
import { Barlow_Condensed } from "next/font/google";
import CampaignFooter from "./campaign-footer";
import { HitoPet } from "@/components/mascot/hito-pet";
import CampaignHeader from "./campaign-header";
import DonationButton from "./donation-button";
import styles from "./campaign.module.css";

const display = Barlow_Condensed({ weight: ["700", "800"], subsets: ["latin"], variable: "--navi-serif", display: "swap" });

export default function NavisediproLayout({ children }) {
  return (
    <div id="navisedipro-inicio" className={`${styles.campaign} ${display.variable}`}>
      <CampaignHeader
        desktopLogo={<Link href="/" aria-label="Inicio de SEDIPRO UNT">
          <Image className={styles.sediproLogo} src="/logos/sedi-logo.svg" alt="SEDIPRO UNT" width={122} height={44} />
        </Link>}
        mobileLogo={<Link href="/navisedipro">
          <Image src="/navisedipro/logo-marketing-full-hd.png" alt="NAVISEDIPRO" width={1920} height={1080} sizes="112px" />
        </Link>}
      >
        <nav aria-label="NAVISEDIPRO">
          <Link href="/navisedipro">Inicio</Link>
          <Link href="/navisedipro#donar">Cómo ayudar</Link>
          <Link href="/navisedipro#fecha-y-lugar">Fecha y lugar</Link>
          <Link href="/navisedipro/ediciones">Ediciones</Link>
          <Link href="/navisedipro/meta">Meta</Link>
        </nav>
        <div className={styles.headerActions}>
          <Link className={styles.contactButton} href="/navisedipro#contacto">Contáctanos</Link>
          <DonationButton className={styles.donateButton}>Quiero donar</DonationButton>
        </div>
      </CampaignHeader>
      {children}
      <div className={styles.campaignFooter}><CampaignFooter /></div>
      <div className={styles.campaignMascot}><HitoPet pathname="/navisedipro" /></div>
    </div>
  );
}
