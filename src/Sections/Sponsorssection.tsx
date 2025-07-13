import React from "react";
import Marquee from "react-fast-marquee";

const SponsorsSection: React.FC = () => (

    <div className="my-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="py-8 bg-white rounded-xl px-5">
            <h3 className="text-left text-lg font-semibold text-gray-900 mb-8">
                Our Sponsors and Partners
            </h3>
            <Marquee gradient={true}>
                <div className="flex flex-row w-full justify-between items-center gap-28">
                    <img
                        src="dist/assets/logos_figma.svg"
                        alt="Sponsor 1"
                        className="h-10 object-cover" />
                    <img
                        src="dist/assets/logos_coursera.svg"
                        alt="Sponsor 1"
                        className="h-6 object-cover" />
                    <img
                        src="dist/assets/logos_udemy.svg"
                        alt="Sponsor 1"
                        className="h-10 object-cover" />
                    <img
                        src="dist/assets/accra_tu.svg"
                        alt="Sponsor 1"
                        className="h-12 object-cover" />
                    <img
                        src="dist/assets/ges.svg"
                        alt="Sponsor 1"
                        className="h-16 object-cover mr-28" />
                </div>
            </Marquee>

        </div>

    </div>

);

export default SponsorsSection;