import Image, { getImageProps } from "next/image";
import { FaLinkedinIn, FaWhatsapp } from "react-icons/fa";
import { absoluteUrl, pageMetadata } from "@/lib/seo.mjs";
import belenNinos from "../../../public/navisedipro/belen-ninos-calle.webp";
import belenPanoramico from "../../../public/navisedipro/belen-panoramico.webp";
import chapaditas from "../../../public/navisedipro/franja-chapaditas.webp";
import styles from "./campaign.module.css";
import { HangingOrnaments } from "./hanging-ornaments";
import { DonationSteps } from "./donation-steps";
import { Countdown } from "./countdown";
import { eventDate } from "./links";
import DonationButton from "./donation-button";

const whatsapp = "https://wa.me/51934630323?text=" + encodeURIComponent("Hola, Angela. Quisiera hacerte una consulta sobre NAVISEDIPRO.");
export const metadata = pageMetadata("/navisedipro");

const options = [
  ["Apadrinamiento y aporte económico", "Si quieres apadrinar un regalo, consulta con el equipo. Para un aporte económico, puedes donar el monto que esté dentro de tus posibilidades.", [
    "Abre el formulario oficial, escribe tus nombres, apellidos y DNI, y selecciona «Aporte económico».",
    "Elige Yape o transferencia BCP. Usa los datos de pago que figuran en el formulario oficial.",
    "Adjunta una imagen del comprobante de hasta 10 MB y envía el formulario.",
  ]],
  ["Donación en especie", "Puedes donar juguetes o insumos para la chocolatada. El equipo se comunicará contigo para coordinar la entrega.", [
    "Escribe tus nombres, apellidos y DNI en el formulario y elige «Regalo físico o insumos».",
    "Marca «Regalo / Juguete», «Insumos para la chocolatada» o ambos, e ingresa tu número de celular.",
    "Indica si también harás un aporte económico. Si solo donarás en especie, marca «Eso es todo» y envía el formulario.",
  ]],
  ["Difusión", "Comparte NAVISEDIPRO para que más personas conozcan la campaña y puedan sumarse esta Navidad."],
];

const campaignUrl = absoluteUrl("/navisedipro");

function DonationLink({ children = "Registrar mi donación" }) {
  return <DonationButton className={styles.button}>
    {children} <span aria-hidden="true">↗</span>
  </DonationButton>;
}

const activities = [
  ["Apadrinamiento · Cartas a Santa", "Apadrina a un niño de la campaña y participa en la dinámica de Cartas a Santa.", "Consultar sobre el apadrinamiento", "#contacto"],
  ["Aportes económicos", "Contribuye a cubrir los insumos y otros gastos de la jornada navideña.", "Hacer un aporte"],
  ["Tómbola solidaria", "Participa en la tómbola para ayudar a recaudar fondos para la campaña.", "Consultar sobre la tómbola", "#contacto"],
  ["Colecta de juguetes e insumos", "Dona juguetes o insumos para la chocolatada. El equipo coordinará contigo la entrega.", "Registrar una donación en especie"],
  ["Auspicios y alianzas", "Si tienes una empresa o emprendimiento, contacta al equipo para coordinar cómo apoyar la campaña.", "Contactar al equipo", "#contacto"],
];

export default function NavisediproPage() {
  const panorama = getImageProps({ src: belenPanoramico, alt: "", sizes: "100vw" }).props;
  return (
    <main id="main-content">
          <section className={`${styles.chapter} ${styles.hero}`} aria-labelledby="navi-title">
            <HangingOrnaments />
            <h1 id="navi-title" className={styles.heroLogo}>
              <Image src="/navisedipro/logo-marketing-full-hd.png" alt="NAVISEDIPRO" width={1920} height={1080} sizes="(max-width: 760px) min(calc(100vw - .75rem), 98vw, 78svh, 665px), min(calc(100vw - 2rem), 81vw, 75svh, 950px)" preload />
            </h1>
            <div className={styles.poster}>
              <picture>
                <source media="(min-aspect-ratio: 3/2)" srcSet={panorama.srcSet} sizes={panorama.sizes} />
                <Image src={belenNinos} alt="" sizes="100vw" loading="eager" fetchPriority="high" />
              </picture>
            </div>
          </section>

          <section id="campana" className={`${styles.chapter} ${styles.story}`} aria-labelledby="navi-story">
            <div className={styles.storyDecor} aria-hidden="true">
              {["lazo", "bastones", "rama", "regalo"].map((name) => (
                <Image key={name} src={`/navisedipro/adorno-${name}.webp`} alt="" width={512} height={512} sizes="(max-width: 760px) 18vw, 14vw" />
              ))}
            </div>
            <div className={styles.copy}>
              <h2 id="navi-story">Una Navidad <span>para compartir</span></h2>
              <p>NAVISEDIPRO es la campaña solidaria de SEDIPRO UNT. Reunimos regalos, víveres y aportes para compartir una chocolatada y una jornada navideña con los niños del Comedor Popular Amigos de Jesús.</p>
            </div>
          </section>

          <Image
            className={styles.storyDivider}
            src={chapaditas}
            alt="Niñas y niños corren uno detrás de otro jugando a las chapaditas, algunos con aviones de juguete en la mano."
            sizes="100vw"
          />

          <section id="donar" className={`${styles.chapter} ${styles.donation}`} aria-labelledby="navi-help">
              <h2 id="navi-help">Cómo ayudar</h2>
              <DonationSteps options={options} campaignUrl={campaignUrl} actions={[
                <DonationLink key="aporte" />, <DonationLink key="especie">Registrar mi donación en especie</DonationLink>,
              ]} />
          </section>

          <section id="actividades" className={`${styles.chapter} ${styles.activities}`} aria-labelledby="navi-activities">
            <div className={styles.activitiesIntro}>
              <h2 id="navi-activities" className={styles.activitiesTitle}>Actividades del proyecto</h2>
              <div className={styles.activitiesDecor}>
                <Image src="/navisedipro/regalos-apilados.webp" alt="" fill sizes="(max-width: 760px) 80vw, 40vw" />
              </div>
            </div>
            <div className={styles.activityPanel}>
              {activities.map(([title, description, action, href], index) => (
                <details key={title} name="navisedipro-actividades" open={index === 0}>
                  <summary>{title}<span aria-hidden="true" /></summary>
                  <p>{description}</p>
                  <div className={styles.activityAction}>
                    {href ? <a className={styles.button} href={href}>{action}</a> : <DonationLink>{action}</DonationLink>}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section id="fecha-y-lugar" className={`${styles.chapter} ${styles.arrival}`} aria-labelledby="navi-dates">
            <div className={styles.arrivalGrid}>
              <div className={styles.arrivalDetails}>
              <h2 id="navi-dates">Fecha y lugar</h2>
              <h3 className={styles.venueTitle}>Comedor Popular Amigos de Jesús</h3>
              <p>En La Esperanza, Trujillo, el equipo de SEDIPRO UNT compartirá una chocolatada y entregará los regalos a los niños del comedor.</p>
              <dl className={styles.dates}>
                <div><dt>Cierre de donaciones</dt><dd><time dateTime="2026-12-15">15 de diciembre</time></dd></div>
                <div><dt>Día del evento</dt><dd><time dateTime={eventDate}>19 de diciembre, 3:00 p. m.</time></dd></div>
              </dl>
              <Countdown />
              <DonationLink />
              </div>
              <div className={styles.location}>
                <iframe title="Vista satelital del punto de referencia en La Esperanza, Trujillo"
                  src="https://maps.google.com/maps?q=-8.0499931%2C-79.0492171&z=15&t=k&output=embed"
                  loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
                <a href="https://www.google.com/maps/search/?api=1&query=-8.0499931%2C-79.0492171" target="_blank" rel="noopener noreferrer">
                  Ver referencia en Google Maps <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </section>

          <section id="contacto" className={`${styles.chapter} ${styles.projectContact}`} aria-labelledby="navi-contact">
            <div className={styles.copy}>
              <h2 id="navi-contact">Contáctanos</h2>
              <div className={styles.contactGrid}>
                <div className={styles.contactProfile}>
                  <Image className={styles.contactPortrait} src="/navisedipro/angela-chancafe.webp" alt="Angela Chancafe Azabache" width={850} height={576} sizes="144px" />
                  <h3>Angela Chancafe Azabache</h3>
                  <p>Directora de NAVISEDIPRO</p>
                  <p>Logística y Finanzas - SEDIPRO UNT</p>
                  <p>Estudiante de Administración - UNT</p>
                  <a className={styles.contactLinkedIn} href="https://linkedin.com/in/angela-chancafe-azabache-193959365" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Angela Chancafe Azabache">
                    <FaLinkedinIn aria-hidden="true" />
                  </a>
                </div>
                <div>
                  <h3>¿En qué podemos ayudarte?</h3>
                  <ul>
                    <li>Auspicios y alianzas para la campaña</li>
                    <li>Consultas sobre los regalos y donaciones</li>
                    <li>Coordinación para la entrega y recepción de regalos</li>
                    <li>Otras consultas sobre NAVISEDIPRO</li>
                  </ul>
                  <a className={`${styles.button} ${styles.shareWhatsApp} ${styles.contactWhatsApp}`} href={whatsapp} target="_blank" rel="noopener noreferrer">
                    <FaWhatsapp aria-hidden="true" /> Hablar con Angela por WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </section>
      </main>
  );
}
