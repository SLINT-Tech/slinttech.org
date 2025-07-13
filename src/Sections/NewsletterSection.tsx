
import React from "react";

const NewsletterSection: React.FC = () => (<section id="community" className="py-16 bg-[#008080] ">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-10 md:flex-row flex-col">
        <div className="text-left">
            <div>
                <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
                <p className="text-lg text-teal-100 max-w-2xl ">
                    Stay updated with news that help you become <br /> the best version of yourself.
                </p>
            </div>

        </div>
        <div className="flex flex-col sm:flex-row gap-4 h-10 justify-center">
            <div className="max-w-7xl mx-auto">
                <div className=" rounded-2xl pl-5 bg-[#FFFFFF1A] shadow-sm">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-transparent text-white placeholder-white/50 text-lg border-none outline-none"
                            />
                        </div>
                        <button className="bg-white cursor-pointer text-black font-semibold px-8 py-4 rounded-r-2xl hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap">
                            Join now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>);


export default NewsletterSection;