import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setIsMenuOpen(false);
    };

    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

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
        <header className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl backdrop-saturate-150 border-b border-white/20 dark:border-gray-800/50 sticky top-0 z-10 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <div className="flex items-center gap-0">
                            <img src="/assets/logo.svg" alt="Logo" className="w-10 h-10" />
                            <span className="hidden md:inline text-[#00a3a3] dark:text-[#00a3a3] text-xl">
                                <span className="font-bold">SLINT</span><span className="ml-[1.5px]">Tech</span>
                            </span>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <a href="#home" onClick={(e) => handleSmoothScroll(e, 'home')} className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer">Home</a>
                        <a href="#explore" onClick={(e) => handleSmoothScroll(e, 'explore')} className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer">Explore</a>
                        <Link to="/signup" className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors">Join Community</Link>
                        <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer">Contact</a>
                    </nav>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-6 space-x-4">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                        {/* <button className="text-[#008080] font-medium hover:text-[#008080] transition-colors">Login</button>
                        <button className="bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors flex items-center">
                            Get Started
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </button> */}
                    </div>

                    {/* Mobile buttons */}
                    <div className="md:hidden flex items-center gap-2">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            aria-label="Toggle dark mode"
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl backdrop-saturate-150 border-t border-white/20 dark:border-gray-800/50 py-4 transition-colors">
                        <div className="flex flex-col space-y-4">
                            <a href="#home" onClick={(e) => handleSmoothScroll(e, 'home')} className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer">Home</a>
                            <a href="#explore" onClick={(e) => handleSmoothScroll(e, 'explore')} className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer">Explore</a>
                            <Link to="/signup" className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors" onClick={() => setIsMenuOpen(false)}>Join Community</Link>
                            <a href="#contact" onClick={(e) => handleSmoothScroll(e, 'contact')} className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors cursor-pointer">Contact</a>
                            <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200 dark:border-gray-800 transition-colors">
                                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-teal-400 transition-colors text-left" onClick={() => setIsMenuOpen(false)}>Login</Link>
                                <Link to="/signup" className="bg-[#008080] dark:bg-teal-600 text-white px-4 py-3 rounded-lg justify-center hover:bg-teal-700 dark:hover:bg-teal-700 transition-colors flex items-center cursor-pointer" onClick={() => setIsMenuOpen(false)}>
                                    Get Started
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}