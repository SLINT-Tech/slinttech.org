import React from "react";
import { Clock, Mail, MapPin } from "lucide-react";

const ContactInfoSection: React.FC = () => (
    <section
        id="contact"
        className="relative overflow-hidden bg-white py-24 transition-colors dark:bg-gray-950"
    >
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.06] dark:opacity-[0.08]"
            style={{ backgroundImage: "url('/assets/ContactInfo.png')" }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
            <div>
                <span className="text-xs font-semibold tracking-[0.18em] text-[#008080] uppercase dark:text-teal-400">
                    Contact
                </span>
                <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl dark:text-white">
                    We are always happy{" "}
                    <span className="text-[#008080] dark:text-teal-400">to assist you</span>
                </h2>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                    Questions about a career track, mentorship, or membership? Send us a
                    note and a real person will get back to you.
                </p>
            </div>

            <div className="rounded-3xl bg-white p-8 ring-1 ring-gray-900/10 sm:p-10 dark:bg-white/[0.04] dark:ring-white/10">
                <ul className="space-y-8">
                    <li className="flex gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#008080]/10 text-[#008080] dark:bg-teal-400/12 dark:text-teal-400">
                            <Mail className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase dark:text-gray-400">
                                Email address
                            </h3>
                            <a
                                href="mailto:contact@slinttech.org"
                                className="mt-1.5 block text-lg font-semibold break-words text-gray-900 transition-colors hover:text-[#008080] dark:text-white dark:hover:text-teal-400"
                            >
                                contact@slinttech.org
                            </a>
                        </div>
                    </li>

                    <li className="flex gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#008080]/10 text-[#008080] dark:bg-teal-400/12 dark:text-teal-400">
                            <Clock className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase dark:text-gray-400">
                                Assistance hours
                            </h3>
                            <p className="mt-1.5 text-lg font-semibold text-gray-900 dark:text-white">
                                Monday to Friday
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                6 am to 8 pm EST
                            </p>
                        </div>
                    </li>

                    <li className="flex gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#008080]/10 text-[#008080] dark:bg-teal-400/12 dark:text-teal-400">
                            <MapPin className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                            <h3 className="text-xs font-semibold tracking-[0.16em] text-gray-500 uppercase dark:text-gray-400">
                                Where we work
                            </h3>
                            <p className="mt-1.5 text-lg font-semibold text-gray-900 dark:text-white">
                                Building future leaders
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                Across the globe
                            </p>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </section>
);

export default ContactInfoSection;
