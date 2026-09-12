// src/app/crown-night/sections/Publicaciones.jsx
'use client'

import { motion } from 'framer-motion'
import { TypingText } from '../components/UI/CustomTexts'
import { fadeIn, staggerContainer } from '../utils/motion'


const publicaciones = [
    {
        id: 'pub-1',
        titulo: '',
        descripcion: '',
        embed: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FSediproUNT%2Fposts%2Fpfbid0zHa21oE4uFHEbfoZdHKR7QLSEuToS8iaariD1eSDkf25qMY9C7NWpm4jFGVWmYdGl&show_text=true&width=500" width="500" height="651" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`,
    },
    {
        id: 'pub-2',
        titulo: 'Reel Crown Night',
        descripcion: '',
        embed: `<iframe src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1374400654344920%2F&show_text=true&width=261&t=0" width="261" height="591" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>`,
    },
    {
        id: 'pub-3',
        titulo: '',
        descripcion: '',
        embed: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2FSediproUNT%2Fposts%2Fpfbid023cDYiYDcPEMYBFVeyDnMxZfPHBxwYdRsmEDj4HrHRADHdopKZ6tDKkABmo8GWzF9l&show_text=true&width=500" width="500" height="670" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`,
    },
    {
        id: 'pub-4',
        titulo: '',
        descripcion: '',
        embed: `<iframe src="https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1378276037745997%2F&show_text=true&width=411&t=0" width="411" height="591" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen="true"></iframe>`,
    },
    {
        id: 'pub-5',
        titulo: '',
        descripcion: '',
        embed: `<iframe src="https://www.facebook.com/plugins/post.php?href=https%3A%2F%2Fwww.facebook.com%2Fphoto.php%3Ffbid%3D1348092357483037%26set%3Da.559333899692224%26type%3D3&show_text=true&width=500" width="500" height="498" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`,
    },
    // 👉 Agrega más publicaciones aquí y aparecerán automáticamente
]

const Publicaciones = () => (
    <section className="py-20 px-4 relative z-10" id="publicaciones">
        <div className="absolute inset-0" />

        <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.15 }}
            className="max-w-7xl mx-auto flex flex-col items-center"
        >
            <TypingText
                title="| Publicaciones"
                textStyles="text-center"
            />

            <motion.p
                variants={fadeIn('up', 'tween', 0.2, 1)}
                className="mt-[8px] font-normal sm:text-[24px] text-[16px] text-center text-foreground/70 max-w-3xl"
            >
                Revive los mejores momentos de{' '}
                <span className="font-extrabold text-primary">Crown Night</span>{' '}
                a través de nuestras publicaciones y reels.
            </motion.p>

            {/* GRID DE PUBLICACIONES */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.1 }}
                className="mt-[48px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center items-start"
            >
                {publicaciones.length === 0 ? (
                    <motion.p
                        variants={fadeIn('up', 'tween', 0.2, 1)}
                        className="col-span-full text-center text-foreground/60"
                    >
                        Aún no hay publicaciones. ¡Vuelve pronto!
                    </motion.p>
                ) : (
                    publicaciones.map((pub, index) => (
                        <motion.div
                            key={pub.id}
                            variants={fadeIn('up', 'tween', 0.15 * index, 0.8)}
                            className="w-full max-w-[500px] flex flex-col items-center gap-3"
                        >
                            <div className="w-full flex justify-center rounded-2xl overflow-hidden shadow-lg bg-foreground/5 backdrop-blur-sm p-2">
                                {/* El iframe se inyecta como HTML tal cual lo copiaste de Facebook */}
                                <div
                                    className="w-full flex justify-center [&_iframe]:max-w-full [&_iframe]:w-full"
                                    dangerouslySetInnerHTML={{ __html: pub.embed }}
                                />
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>

            <motion.div
                variants={fadeIn('up', 'tween', 0.3, 1)}
                className="mt-[28px]"
            >
                <svg
                    className="w-[18px] h-[28px] text-primary animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                </svg>
            </motion.div>
        </motion.div>
    </section>
)

export default Publicaciones