import React from "react";

const ContactInfoSection: React.FC = () => (
    <section
        id="community"
        className="py-16 relative bg-cover bg-center"
        style={{
            backgroundImage: "url('dist/assets/ContactInfo.png')",
        }}
    >
        <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 pointer-events-none transition-colors"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-start">
            <div className="text-left flex-1">
                <h2 className="text-lg text-black dark:text-gray-300 mb-4">Contact Info</h2>
                <p className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-8 max-w-2xl">
                    We are always happy <br /> to assist you
                </p>
            </div>
            <div className="flex flex-row gap-10">
                <div>
                    <div className="flex flex-col items-start mb-4">
                        <span className="text-2xl text-black dark:text-white mr-2">Email Address</span>
                        <hr className="w-6 border-t-3 border-black dark:border-gray-300 my-5" />
                        <a
                            href="mailto:contact@slinttech.org"
                            className="text-xl text-black dark:text-gray-300 hover:underline mb-3"
                        >
                            contact@slinttech.org
                        </a>
                        <div className="text-black dark:text-gray-300">
                            Assistance hours
                        </div>
                        <div className="text-black dark:text-gray-300">
                            Monday - Friday 6 am to 8 pm EST
                        </div>
                    </div>
                </div>

            </div>

        </div>
    </section>
);

export default ContactInfoSection;