import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const portraits = [
    {
        name: 'hero-mentee-1',
        alt: 'A SlintTech mentee holding a laptop showing the code they are building',
    },
    {
        name: 'hero-mentee-2',
        alt: 'A SlintTech mentee in a SlintTech hoodie holding a laptop showing code',
    },
] as const;

type PortraitIndex = 0 | 1;

const VISIBLE_MS = 6500;
const STORAGE_KEY = 'heroPortrait';

// rendered widths: 320px on phones, 24rem from sm, about 26rem at xl
const SIZES = '(min-width: 1280px) 415px, (min-width: 640px) 384px, 320px';

// React 18 does not know fetchPriority, so pass the lowercase DOM attribute
const highPriority = { fetchpriority: 'high' } as Record<string, string>;

const srcSetFor = (name: string) =>
    `/assets/${name}-600.webp 600w, /assets/${name}.webp 900w`;

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** With reduced motion, show one portrait per visit and alternate between visits. */
const readNextPortrait = (): PortraitIndex => {
    try {
        return localStorage.getItem(STORAGE_KEY) === '0' ? 1 : 0;
    } catch {
        return 0;
    }
};

const HeroPortraits = () => {
    const [reduceMotion] = useState(prefersReducedMotion);
    const [staticPortrait] = useState<PortraitIndex>(readNextPortrait);
    const [active, setActive] = useState<PortraitIndex>(0);
    const [userPaused, setUserPaused] = useState(false);
    const [tabHidden, setTabHidden] = useState(
        () => typeof document !== 'undefined' && document.hidden,
    );

    // keeps changing until someone presses pause (WCAG 2.2.2); a background tab also pauses it
    const running = !reduceMotion && !userPaused && !tabHidden;

    useEffect(() => {
        if (!reduceMotion) return;
        try {
            localStorage.setItem(STORAGE_KEY, String(staticPortrait));
        } catch {
            // storage can be blocked; the portrait simply stops alternating
        }
    }, [reduceMotion, staticPortrait]);

    useEffect(() => {
        const onVisibilityChange = () => setTabHidden(document.hidden);
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => {
        if (!running) return;
        const timer = window.setTimeout(() => {
            setActive((current) => (current === 0 ? 1 : 0));
        }, VISIBLE_MS);
        return () => window.clearTimeout(timer);
    }, [running, active]);

    const isPlaying = !userPaused;
    const toggle = () => setUserPaused((paused) => !paused);

    const sizing =
        'w-full lg:h-[38rem] lg:w-auto lg:object-contain lg:object-bottom xl:h-[41rem]';
    const box = 'relative w-full max-w-xs sm:max-w-sm lg:-mt-6 lg:w-auto lg:max-w-none';

    if (reduceMotion) {
        const portrait = portraits[staticPortrait];
        return (
            <div className={box}>
                <img
                    src={`/assets/${portrait.name}.webp`}
                    srcSet={srcSetFor(portrait.name)}
                    sizes={SIZES}
                    alt={portrait.alt}
                    width={900}
                    height={1424}
                    loading="eager"
                    {...highPriority}
                    className={`block ${sizing}`}
                />
            </div>
        );
    }

    return (
        <div className={box}>
            {portraits.map((portrait, index) => {
                const visible = active === index;
                const isFirst = index === 0;
                return (
                    <img
                        key={portrait.name}
                        src={`/assets/${portrait.name}.webp`}
                        srcSet={srcSetFor(portrait.name)}
                        sizes={SIZES}
                        alt={visible ? portrait.alt : ''}
                        aria-hidden={visible ? undefined : 'true'}
                        width={900}
                        height={1424}
                        {...(isFirst ? { loading: 'eager' as const, ...highPriority } : { decoding: 'async' as const })}
                        className={`block transition-opacity duration-[1200ms] ease-in-out ${
                            isFirst ? sizing : 'absolute inset-0 h-full w-full object-contain object-bottom'
                        } ${visible ? 'opacity-100' : 'opacity-0'}`}
                    />
                );
            })}

            <button
                type="button"
                onClick={toggle}
                aria-label={isPlaying ? 'Pause image slideshow' : 'Play image slideshow'}
                className="absolute right-3 bottom-3 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/80 text-gray-800 shadow-sm ring-1 ring-gray-900/15 backdrop-blur-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#008080] dark:bg-gray-900/80 dark:text-gray-100 dark:ring-white/20 dark:hover:bg-gray-900 dark:focus-visible:outline-teal-400"
            >
                {isPlaying ? (
                    <Pause aria-hidden="true" className="h-4 w-4" />
                ) : (
                    <Play aria-hidden="true" className="h-4 w-4" />
                )}
            </button>
        </div>
    );
};

export default HeroPortraits;
