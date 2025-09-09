import { ArrowRight, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

const careerPaths = [
    {
        image:
            "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "Full Stack Development",
        title: "Full Stack Development",
        description: "Master both frontend and backend technologies to build complete web applications."
    },
    {
        image:
            "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "Frontend Development",
        title: "Frontend Development",
        description: "Create beautiful, responsive user interfaces using modern web technologies."
    },
    {
        image:
            "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "Backend Development",
        title: "Backend Development",
        description: "Build robust server-side applications and APIs that power modern web services."
    },
    {
        image:
            "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "Mobile Development",
        title: "Mobile Development",
        description: "Develop native and cross-platform mobile applications for iOS and Android."
    },
    {
        image:
            "https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "Machine Learning/AI",
        title: "Machine Learning/AI",
        description: "Explore artificial intelligence and machine learning to solve complex problems."
    },
    {
        image:
            "https://images.pexels.com/photos/590020/pexels-photo-590020.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "Data Science",
        title: "Data Science",
        description: "Analyze and interpret complex data to drive business decisions and insights."
    },
    {
        image:
            "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "UI/UX Design",
        title: "UI/UX Design",
        description: "Design intuitive and engaging user experiences for digital products."
    },
];

const CoursesSection: React.FC = () => {
    const navigate = useNavigate();

    const handleJoinCommunity = () => {
        navigate('/signup');
    };

    return (
        <section id="explore" className="my-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
            <div className="py-8 bg-white rounded-xl px-5">
                <div className="text-left mb-12">
                    <h2 className="text-lg font-semibold text-gray-900mb-4">
                        Career Paths
                    </h2>
                    <p className="text-[#9C9C9C] leading-relaxed text-sm max-w-2xl">
                        Choose your path and start your journey with expert mentorship and hands-on learning.
                        Join our community to unlock your potential in these high-demand fields.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {careerPaths.map((path, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl hover:shadow-md transition-shadow border border-gray-200"
                        >
                            <div className="p-3 justify-between flex flex-col h-full">
                                <div>
                                    <img
                                        src={path.image}
                                        alt={path.alt}
                                        className="w-full h-48 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {path.title}
                                    </h3>
                                    <p className="text-[#9C9C9C] text-sm leading-relaxed mb-4">
                                        {path.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Ready to Start Your Journey?
                    </h3>
                    <p className="text-[#9C9C9C] mb-6 max-w-2xl mx-auto">
                        Join our community of passionate learners and get matched with expert mentors
                        who will guide you through your chosen career path.
                    </p>
                    <button
                        onClick={handleJoinCommunity}
                        className="bg-[#008080] text-white px-8 py-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                    >
                        Join Our Community
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default CoursesSection;