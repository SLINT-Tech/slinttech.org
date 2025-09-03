import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

const NewsletterSection: React.FC = () => {
    const navigate = useNavigate();

    const handleJoinCommunity = () => {
        navigate('/signup');
    };

    return (<section id="community" className="py-16 bg-[#008080] ">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-10 md:flex-row flex-col">
        <div className="text-left">
            <div>
                <h2 className="text-3xl font-bold text-white mb-4">Join Our Community</h2>
                <p className="text-lg text-teal-100 max-w-2xl ">
                    Connect with mentors and fellow learners to accelerate <br /> your growth and unlock new opportunities.
                </p>
            </div>

        </div>
        <div className="flex justify-center">
            <button 
                onClick={handleJoinCommunity}
                className="bg-white cursor-pointer text-black font-semibold px-8 py-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap flex items-center gap-2"
            >
                Join Our Community
                <ArrowRight className="w-5 h-5" />
            </button>
        </div>
    </div>
</section>);
};


export default NewsletterSection;