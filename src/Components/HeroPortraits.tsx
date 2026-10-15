import { useEffect, useState } from 'react';

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

const STORAGE_KEY = 'heroPortrait';

// rendered widths: 320px on phones, 24rem from sm, about 26rem at xl
const SIZES = '(min-width: 1280px) 415px, (min-width: 640px) 384px, 320px';

// React 18 does not know fetchPriority, so pass the lowercase DOM attribute
const highPriority = { fetchpriority: 'high' } as Record<string, string>;

const srcSetFor = (name: string) =>
    `/assets/${name}-600.webp 600w, /assets/${name}.webp 900w`;

const readNextPortrait = (): PortraitIndex => {
    try {
        return localStorage.getItem(STORAGE_KEY) === '0' ? 1 : 0;
    } catch {
        return 0;
    }
};

/**
 * Shows one portrait per visit and alternates between visits. A timed crossfade between
 * two different people was tiring to watch, so both appear over time without motion.
 */
const HeroPortraits = () => {
    const [index] = useState<PortraitIndex>(readNextPortrait);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, String(index));
        } catch {
            // storage can be blocked; the portrait simply stops alternating
        }
    }, [index]);

    const portrait = portraits[index];
    return (
        <div className="relative w-full max-w-xs sm:max-w-sm lg:-mt-6 lg:w-auto lg:max-w-none">
            <img
                src={`/assets/${portrait.name}.webp`}
                srcSet={srcSetFor(portrait.name)}
                sizes={SIZES}
                alt={portrait.alt}
                width={900}
                height={1424}
                loading="eager"
                {...highPriority}
                className="block w-full lg:h-[38rem] lg:w-auto lg:object-contain lg:object-bottom xl:h-[41rem]"
            />
        </div>
    );
};

export default HeroPortraits;
