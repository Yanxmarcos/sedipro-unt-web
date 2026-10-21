"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { Landmark, Medal, Trophy, Users, X } from "lucide-react";
import { RECOGNITIONS } from "./content";
import styles from "./recognition-landscape.module.css";

// The route is drawn in the reference image's coordinate system. Its width
// narrows towards the summit, rather than using a uniform SVG stroke.
const SEGMENTS = [
  { points: [[-100,1025],[330,965],[1100,925],[1205,795]], widths: [110,135] },
  { points: [[1205,795],[1400,625],[325,665],[345,585]], widths: [135,70] },
  { points: [[345,585],[350,551],[543,539],[650,506]], widths: [70,32] },
  { points: [[650,506],[822,460],[445,480],[450,446]], widths: [32,19] },
  { points: [[450,446],[459,413],[1230,397],[1646,385]], widths: [19,5] },
];

function onCurve(points, t) {
  const [a,b,c,d] = points, u = 1 - t;
  return {
    x: u*u*u*a[0] + 3*u*u*t*b[0] + 3*u*t*t*c[0] + t*t*t*d[0],
    y: u*u*u*a[1] + 3*u*u*t*b[1] + 3*u*t*t*c[1] + t*t*t*d[1],
    dx: 3*u*u*(b[0]-a[0]) + 6*u*t*(c[0]-b[0]) + 3*t*t*(d[0]-c[0]),
    dy: 3*u*u*(b[1]-a[1]) + 6*u*t*(c[1]-b[1]) + 3*t*t*(d[1]-c[1]),
  };
}

function roadGeometry() {
  const left = [], right = [];
  SEGMENTS.forEach(({ points, widths }) => {
    for (let step = 0; step <= 100; step++) {
      const t = step / 100, point = onCurve(points, t);
      const length = Math.hypot(point.dx, point.dy);
      const half = (widths[0] + (widths[1]-widths[0])*t)/2;
      left.push([point.x-point.dy/length*half, point.y+point.dx/length*half]);
      right.push([point.x+point.dy/length*half, point.y-point.dx/length*half]);
    }
  });
  // Remove small inner-offset loops at the tight hairpins before closing the
  // asphalt shape. This keeps the inside edge smooth at every screen width.
  const trimLoops = points => {
    const clean = [];
    for (const point of points) {
      if (clean.length > 2) {
        const a = clean[clean.length-1], b = point;
        for (let index = clean.length-3; index >= 0; index--) {
          const c = clean[index], d = clean[index+1];
          const denominator = (b[0]-a[0])*(d[1]-c[1])-(b[1]-a[1])*(d[0]-c[0]);
          if (Math.abs(denominator) < .00001) continue;
          const t = ((c[0]-a[0])*(d[1]-c[1])-(c[1]-a[1])*(d[0]-c[0]))/denominator;
          const u = ((c[0]-a[0])*(b[1]-a[1])-(c[1]-a[1])*(b[0]-a[0]))/denominator;
          if (t > 0 && t < 1 && u > 0 && u < 1) {
            clean.splice(index+1, clean.length-index-1, [a[0]+t*(b[0]-a[0]), a[1]+t*(b[1]-a[1])]);
            break;
          }
        }
      }
      clean.push(point);
    }
    return clean;
  };
  const outline = [...trimLoops(left), ...trimLoops(right).reverse()].map(point => point.map(value => value.toFixed(2)).join(",")).join("L");
  const center = "M-100 1025" + SEGMENTS.map(({points}) => `C${points.slice(1).map(p => p.join(" ")).join(" ")}`).join("");
  return { outline: `M${outline}Z`, center };
}

const ROAD = roadGeometry();
const STOPS = [
  { year: "2020", segment: 0, t: .14, color: "#597cba" },
  { year: "2021", segment: 0, t: .55, color: "#486da8" },
  { year: "2022", segment: 1, t: .30, color: "#5276b2" },
  { year: "2023", segment: 4, t: .13, color: "#304d90" },
  { year: "2024", segment: 4, t: .65, color: "#444a89" },
  { year: "2025", segment: 4, t: .93, color: "#29295d" },
].map(stop => ({...stop, ...onCurve(SEGMENTS[stop.segment].points, stop.t)}));

function MountainScene({ id }) {
  return <svg className={styles.art} viewBox="0 120 2048 920" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2=".35"><stop stopColor="#547bb4"/><stop offset="1" stopColor="#304d90"/></linearGradient>
      <linearGradient id={`${id}-snow`} x1="0" x2="1"><stop stopColor="#cbd3e2"/><stop offset=".5" stopColor="#f0f1f6"/><stop offset="1" stopColor="#c5ccdc"/></linearGradient>
      <linearGradient id={`${id}-asphalt`} x1="0" y1="1" x2=".4" y2="0"><stop stopColor="#202842"/><stop offset=".5" stopColor="#26314e"/><stop offset="1" stopColor="#171d31"/></linearGradient>
      <filter id={`${id}-shadow`} x="-20%" y="-25%" width="150%" height="160%"><feDropShadow dx="0" dy="10" stdDeviation="7" floodColor="#162348" floodOpacity=".28"/></filter>
      <filter id={`${id}-laneShadow`} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="1.2" floodColor="#000" floodOpacity=".65"/></filter>
    </defs>
    <g strokeLinejoin="round">
      <path d="M1190 1040L1645 385L2048 1040Z" fill={`url(#${id}-face)`}/>
      <path d="M1645 385L1650 1040H2048Z" fill="#28396f"/>
      <path d="M1500 602L1645 385L1777 600L1735 578L1690 493L1614 674L1623 548L1570 588Z" fill={`url(#${id}-snow)`}/>
      <path d="M1645 385L1614 674L1690 493Z" fill="#dce0eb"/>
      <path d="M1080 1040L1478 460L1840 1040Z" fill="#3d60a0"/>
      <path d="M1478 460L1442 1040H1840Z" fill="#2d4481"/>
      <path d="M1370 618L1478 460L1560 596L1519 553L1490 506L1456 558L1441 552L1419 615L1410 578Z" fill={`url(#${id}-snow)`}/>
      <path d="M1478 460L1456 558L1442 575L1490 506Z" fill="#edf0f7"/>
      <path d="M890 1040L1241 526L1555 1040Z" fill="#4269a7"/>
      <path d="M1241 526L1215 1040H1555Z" fill="#2e4a8a"/>
      <path d="M1169 632L1241 526L1304 630L1268 596L1254 616L1238 578L1208 649L1194 605Z" fill={`url(#${id}-snow)`}/>
      <path d="M1090 1040L1330 645L1610 1040Z" fill="#587eb6"/>
      <path d="M1330 645L1312 1040H1610Z" fill="#354e8e"/>
      <path d="M1266 751L1330 645L1414 764L1374 738L1341 696L1290 784L1297 721Z" fill={`url(#${id}-snow)`}/>
      <path d="M742 1040L969 701L1215 1040Z" fill="#4c75ad"/>
      <path d="M969 701L971 1040H1215Z" fill="#304d90"/>
      <path d="M894 812L969 701L1035 792L1000 779L976 741L953 796L939 770Z" fill={`url(#${id}-snow)`}/>
    </g>
    <path d={ROAD.outline} fill={`url(#${id}-asphalt)`} stroke="#11192d" strokeWidth="2" filter={`url(#${id}-shadow)`}/>
    <path d={ROAD.center} fill="none" stroke="#f6f1fa" strokeWidth="2.4" strokeDasharray="12 11" strokeLinecap="round" filter={`url(#${id}-laneShadow)`}/>
    <g fill="#29295d" stroke="#141c37" strokeWidth="2" strokeLinejoin="round">
      <circle cx="1689" cy="275" r="19"/>
      <path d="M1686 300C1695 298 1705 304 1712 310L1730 326Q1735 330 1736 338L1744 362Q1748 374 1739 375Q1733 376 1731 367L1724 342L1705 328L1710 370L1732 460Q1736 473 1725 475Q1717 477 1713 467L1693 400L1672 416L1675 445Q1675 456 1666 455Q1657 455 1655 445L1650 408Q1648 401 1655 394L1682 371L1679 331L1655 348Q1648 351 1642 347L1636 344Q1632 338 1638 333L1653 337L1677 313Q1680 303 1686 300Z"/>
    </g>
    <path d="M1644 165V428" stroke="#29295d" strokeWidth="5" strokeLinecap="round"/>
  </svg>;
}

function AwardIcon({ award }) {
  const Icon = award.role === "Reconocimiento Institucional" ? Landmark : award.role === "Organización de Evento" ? Users : award.company.startsWith("1er") ? Trophy : Medal;
  return <Icon size={19} strokeWidth={1.6} aria-hidden="true"/>;
}

export function RecognitionLandscape() {
  const id = useId().replace(/:/g, "");
  const [openYear, setOpenYear] = useState(null);
  const root = useRef(null), trigger = useRef(null), popup = useRef(null);
  useEffect(() => {
    if (!openYear) return;
    const outside = event => {
      const checkpoint = event.target.closest?.("[data-recognition-checkpoint]");
      if (popup.current?.contains(event.target) || checkpoint && root.current?.contains(checkpoint)) return;
      setOpenYear(null);
    };
    const escape = event => { if (event.key === "Escape") { setOpenYear(null); trigger.current?.focus(); } };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, [openYear]);
  const active = STOPS.find(stop => stop.year === openYear);
  return <div ref={root} className={styles.landscape} aria-label="Camino de reconocimientos de 2020 a 2025">
    <MountainScene id={id}/>
    <div className={styles.flag} aria-hidden="true"><Image src="/logos/sedi-logo.svg" alt="" width={156} height={55}/></div>
    {STOPS.map((stop, index) => <button key={stop.year} type="button" data-recognition-checkpoint className={styles.checkpoint} style={{left:`${stop.x/2048*100}%`,top:`${(stop.y-120)/920*100}%`}} aria-label={`Ver reconocimientos de ${stop.year}`} aria-expanded={openYear === stop.year} aria-controls={openYear === stop.year ? `${id}-awards` : undefined} onClick={event => { trigger.current=event.currentTarget; setOpenYear(value=>value===stop.year?null:stop.year); }}>
      <span className={styles.year}>{stop.year}</span>
      <svg viewBox="0 0 140 190" aria-hidden="true" focusable="false">
        <defs><linearGradient id={`${id}-pin-${index}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8ba6d3"/><stop offset=".38" stopColor={stop.color}/><stop offset="1" stopColor="#25366f"/></linearGradient></defs>
        <ellipse cx="70" cy="181" rx="25" ry="6" fill="#162446" opacity=".18"/>
        <path d="M70 185C49 150 8 107 8 72C8 36 35 8 70 8C105 8 132 36 132 72C132 108 93 150 70 185Z" fill={`url(#${id}-pin-${index})`} stroke="#24376c" strokeWidth="2"/>
        <path d="M70 12C38 12 13 38 13 72C13 98 37 129 56 155" fill="none" stroke="#bccde6" strokeWidth="2" opacity=".55"/>
        <circle cx="70" cy="72" r="47" fill="#f6f1fa" stroke="#dce3f0" strokeWidth="3"/>
        {index%2 ? <Trophy x="48" y="49" width="44" height="44" strokeWidth={1.5} color="#304d90"/> : <Medal x="48" y="49" width="44" height="44" strokeWidth={1.5} color="#304d90"/>}
      </svg>
    </button>)}
    {active && <div ref={popup} id={`${id}-awards`} className={styles.popup} role="region" aria-labelledby={`${id}-year-title`} style={{left:`clamp(16px, ${active.x/2048*100}%, calc(100% - 378px))`,top:`${Math.max(0,(active.y-120)/920*100-46)}%`}}>
      <div className={styles.popupHeading}><h3 id={`${id}-year-title`}>{openYear}</h3><button type="button" aria-label="Cerrar reconocimientos" onClick={()=>{setOpenYear(null);trigger.current?.focus();}}><X size={20} aria-hidden="true"/></button></div>
      <ul>{RECOGNITIONS.filter(award=>award.period===openYear).map(award=><li key={award.company}><AwardIcon award={award}/><div><h4>{award.company}</h4><p>{award.role}</p></div></li>)}</ul>
    </div>}
  </div>;
}
