import React from "react";
import Marquee from "react-fast-marquee";

const SponsorsSection: React.FC = () => (

    <div className="my-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 dark:bg-gray-950 transition-colors">
        <div className="py-8 bg-white dark:bg-gray-900 rounded-xl px-5 transition-colors">
            <h3 className="text-left text-lg font-semibold text-gray-900 dark:text-white mb-8">
                Our Sponsors and Partners
            </h3>
            <Marquee gradient={true}>
                <div className="flex flex-row w-full justify-between items-center gap-28">
                    <img
                        src="/assets/logos_figma.svg"
                        alt="Sponsor 1"
                        className="h-10 object-cover" />
                    <img
                        src="/assets/logos_coursera.svg"
                        alt="Sponsor 1"
                        className="h-6 object-cover" />
                    <img
                        src="/assets/logos_udemy.svg"
                        alt="Sponsor 1"
                        className="h-10 object-cover" />
                    <img
                        src="/assets/accra_tu.svg"
                        alt="Sponsor 1"
                        className="h-12 object-cover" />
                    <img
                        src="/assets/ges.svg"
                        alt="Sponsor 1"
                        className="h-16 object-cover mr-28" />
                </div>
            </Marquee>

        </div>

    </div>

);

export default SponsorsSection;