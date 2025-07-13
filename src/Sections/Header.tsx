import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    return (
        <header className="bg-white/50 border-b border-gray-100 sticky top-0 z-10 backdrop-blur-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex items-center">
                            <img src="dist/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <a href="#home" className="text-gray-700 hover:text-[#008080] transition-colors">Home</a>
                        <a href="#explore" className="text-gray-700 hover:text-[#008080] transition-colors">Explore</a>
                        <a href="#community" className="text-gray-700 hover:text-[#008080] transition-colors">Join Community</a>
                        <a href="#contact" className="text-gray-700 hover:text-[#008080] transition-colors">Contact</a>
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-6 space-x-4">
                        {/* <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                        </button> */}
                        <button className="text-[#008080] font-medium hover:text-[#008080] transition-colors">Login</button>
                        <button className="bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center">
                            Get Started
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={toggleMenu}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden bg-transparent border-t border-gray-200 py-4">
                        <div className="flex flex-col space-y-4">
                            <a href="#home" className="text-gray-700 hover:text-[#008080] transition-colors">Home</a>
                            <a href="#explore" className="text-gray-700 hover:text-[#008080] transition-colors">Explore</a>
                            <a href="#community" className="text-gray-700 hover:text-[#008080] transition-colors">Join Community</a>
                            <a href="#contact" className="text-gray-700 hover:text-[#008080] transition-colors">Contact</a>
                            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                                <button className="text-gray-700 hover:text-[#008080] transition-colors text-left">Login</button>
                                <button className="bg-[#008080] text-white px-4 py-3 rounded-lg justify-center hover:bg-teal-700 transition-colors flex items-center">
                                    Get Started
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}