import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import React from "react";

const Footer: React.FC = () => (
    <footer className="bg-[#171717] text-white pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-5 gap-8">

                {/* Logo and Description */}
                <div className="space-y-4">
                    <img src="/assets/Slintech_logo.svg" alt="SlintTech Logo" className="h-12 mb-2" />
                    <p className="text-gray-400">
                        A108 Adam Street New York, NY 535022
                        United States <br />  <br /> Phone: +1 5589 55488 55 <br /> <br /> Email: info@example.com <br /><br />
                    </p>
                    <div className="flex space-x-4">
                        <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                        <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                    </div>
                </div>

                <div></div>

                {/* Our Team */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Our Team</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Team</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>

                {/* Customer Care */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">Customer Care</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                    </ul>
                </div>

                {/* More Courses */}
                <div>
                    <h3 className="text-lg font-semibold mb-4">More Courses</h3>
                    <ul className="space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Web Development</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Data Science</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Mobile Development</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Design</a></li>
                    </ul>
                </div>
            </div>


        </div>
        <div className="border-t border-gray-800 mt-8 py-8 bg-white text-center text-black flex justify-center items-center">
            <p>&copy; Copyright <span className="font-bold">SlintTech.</span> All Rights Reserved </p>
        </div>
    </footer>
);

export default Footer;