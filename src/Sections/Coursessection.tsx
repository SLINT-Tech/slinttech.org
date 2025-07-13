import { ArrowRight, Clock, Star } from "lucide-react";
import React from "react";

const courses = [
    {
        image:
            "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "Professional CV Writing",
        title: "Professional CV Writing",
        rating: 4.9,
        reviews: 267,
        duration: "4 hours",
    },
    {
        image:
            "https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "HTML Fundamentals",
        title: "HTML Fundamentals: 2024 for Java",
        rating: 4.8,
        reviews: 1324,
        duration: "12 hours",
    },
    {
        image:
            "https://images.pexels.com/photos/60504/security-protection-anti-virus-software-60504.jpeg?auto=compress&cs=tinysrgb&w=600",
        alt: "Intro to Cybersecurity",
        title: "Intro to Cybersecurity",
        rating: 4.7,
        reviews: 892,
        duration: "8 hours",
    },
];

const CoursesSection: React.FC = () => (
    <section id="explore" className="my-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="py-8 bg-white rounded-xl px-5">
            <div className="text-left mb-12">
                <h2 className="text-lg font-semibold text-gray-900mb-4">
                    Explore Courses
                </h2>
                <p className="text-[#9C9C9C] leading-relaxed text-sm max-w-2xl">
                    Expand your skills with cutting-edge courses in trending fields. Perfect for job applications,
                    freelance gigs, and growing your professional brand.
                </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {courses.map((course, idx) => (
                    <div
                        key={idx}
                        className="bg-white rounded-xl hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="p-3 justify-between flex flex-col h-full">
                            <div>
                                <img
                                    src={course.image}
                                    alt={course.alt}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {course.title}
                                </h3>
                                <div className="flex items-center mb-2">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 ml-2">
                                        {course.rating} ({course.reviews.toLocaleString()})
                                    </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <Clock className="w-4 h-4 mr-1" />
                                    <span>{course.duration}</span>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button className="flex items-center  cursor-pointer gap-2 w-fit bg-[#008080] text-white py-2 px-4 rounded-full hover:bg-teal-700 transition-colors">
                                    View Course
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                <div

                    className="bg-[#F6F6F6] rounded-xl"
                >
                    <div className="p-3 justify-center items-center flex flex-col h-full">
                        <div className="flex flex-col gap-5 py-10">
                            <div className="text-center">We have a variety of <br /> courses available

                            </div>


                            <button className="flex items-center cursor-pointer gap-2 w-fit bg-[#008080] text-white py-2 px-4 rounded-full hover:bg-teal-700 transition-colors">
                                View More
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>

                        </div>


                    </div>
                </div>
            </div>


        </div>
    </section>
);

export default CoursesSection;
