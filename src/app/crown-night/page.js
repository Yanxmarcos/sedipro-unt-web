// src/app/crown-night/page.js
'use client'

import {
    Hero,
    About,
    Miss,        
    Mister,    
    GetStarted,
    // WhatsNew,
    World,
    Insights,
    Feedback,
    Todos,
    ResultadosEnVivo ,
    Publicaciones
} from './sections'
import { Navbar, Footer, BackToTop } from './components'
import PixelSnow from './components/PixelSnow'
import { useIsDesktop } from './hooks/useIsDesktop'

export default function CrownNightPage() {
    // Solo renderiza PixelSnow en desktop (pantallas >= 1024px)
    const isDesktop = useIsDesktop(1024)

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            {/* Fondo PixelSnow - SOLO EN DESKTOP */}
            {isDesktop && (
                <div className="fixed inset-0 w-full h-full -z-10">
                    <PixelSnow 
                        color="#ffffff"
                        flakeSize={0.01}
                        minFlakeSize={1.25}
                        pixelResolution={500}
                        speed={0.5}
                        density={0.3}
                        direction={125}
                        brightness={1}
                        depthFade={20}
                        farPlane={12}
                        gamma={0.4545}
                        variant="square"
                    />
                </div>
            )}

            {/* Fondo alternativo para móvil */}
            {!isDesktop && (
                <div className="fixed inset-0 w-full h-full -z-10 bg-background" />
            )}

            <div className="fixed inset-0 bg-background/5 pointer-events-none -z-5" />

            <div className="relative z-10">
                <Navbar />
                <Hero />
                <About />
                <Publicaciones />
                <Miss />         
                <Mister />     
                <Todos />
                <ResultadosEnVivo />
                <Insights />
                <World />      
                <GetStarted />
                {/* <WhatsNew /> */}
                <Feedback />
                <BackToTop />
                <Footer />
            </div>
        </div>
    )
}