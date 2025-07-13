import { ArrowRight, Facebook, Instagram, Twitter } from "lucide-react";
import React from "react";

const GetStartedSection: React.FC = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-20">
        {/* Header Section */}
        <div className="mb-10 flex flex-row justify-between">
            <div>
                <h1 className="text-lg font-medium text-gray-600 mb-4">Get Started</h1>
                <h2 className="text-5xl font-bold text-gray-900 mb-6">Get in touch with us. <br /> We're here to assist you.</h2>
                {/* <p className="text-5xl font-bold text-gray-900"></p> */}
            </div>



            {/* Social Media Icons */}
            <div className=" top-8 right-8 flex flex-col space-y-4">
                <a href="#" className="w-10 h-10  border rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10  border rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10  border rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <Twitter className="w-5 h-5" />
                </a>
            </div>

        </div>

        {/* Form Section */}
        <div className="relative mb-5">


            {/* Contact Form */}
            <div className="max-w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Name Field */}
                    <div className="md:col-span-1">
                        <label className="block text-gray-700 font-medium mb-2">Your Name</label>
                        <input
                            type="text"
                            className="w-full border-0 border-b border-gray-300 bg-transparent py-3 px-0 focus:border-blue-500 focus:outline-hidden focus:ring-0 text-gray-900"
                            placeholder=""
                        />
                    </div>

                    {/* Email Field */}
                    <div className="md:col-span-1">
                        <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full border-0 border-b border-gray-300 bg-transparent py-3 px-0 focus:border-blue-500 focus:outline-hidden focus:ring-0 text-gray-900"
                            placeholder=""
                        />
                    </div>

                    {/* Phone Field */}
                    <div className="md:col-span-1">
                        <label className="block text-gray-700 font-medium mb-2">Phone Number (optional)</label>
                        <input
                            type="tel"
                            className="w-full border-0 border-b border-gray-300 bg-transparent py-3 px-0 focus:border-blue-500 focus:outline-hidden focus:ring-0 text-gray-900"
                            placeholder=""
                        />
                    </div>
                </div>

                {/* Message Field */}
                <div className="mb-8">
                    <label className="block text-gray-700 font-medium mb-2">Message</label>
                    <textarea
                        rows={4}
                        className="w-full border-0 border-b border-gray-300 bg-transparent py-3 px-0 focus:border-blue-500 focus:outline-hidden focus:ring-0 text-gray-900 resize-none"
                        placeholder=""
                    ></textarea>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="bg-black cursor-pointer hover:bg-black/50 text-white font-medium py-4 px-8 rounded-2xl transition-colors duration-200 flex items-center space-x-2"
                >
                    <span>Leave us a Message</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                </button>
            </div>
        </div>
    </div>
);

export default GetStartedSection;