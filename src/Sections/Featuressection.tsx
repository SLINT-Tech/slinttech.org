import { BookOpen } from "lucide-react";
import FeaturesSectionCard from "../Components/Featuressectioncard";

export function FeaturesSection() {
    return (
        <section className="">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-5 items-center">
                    {/* Learn Skills */}
                    <FeaturesSectionCard image={"/assets/first.png"} icon={<BookOpen className="w-5 h-5 text-blue-600" />} title={"Learn Skills That Pay In The Real World"} description={"From tech and design to business and marketing — access the kind of knowledge employers and startups care about. Build skills today, start earning tomorrow."} />
                    <FeaturesSectionCard image={"/assets/second.png"} icon={<BookOpen className="w-5 h-5 text-blue-600" />} title={"Learn Anywhere, Anytime"} description={"Waiting for a lecture? Stuck in traffic? Use your phone, laptop, or tablet to sharpen new skills on your own schedule. Your future deserves every moment."} />
                    <FeaturesSectionCard image={"/assets/third.png"} icon={<BookOpen className="w-5 h-5 text-blue-600" />} title={"Boost Your CV & Portfolio"} description={"Show off your new skills with recognized certificates from global platforms. Perfect for job applications, freelance gigs, and growing your personal brand."} />
                    <div className="space-y-6 bg-white px-5 pt-5 rounded-xl shadow-xs">
                        <div className="flex items-center space-x-3">
                            {/* <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-600" />
                            </div> */}
                            <h3 className="text-lg font-semibold text-gray-900">Join a Community That Moves</h3>
                        </div>
                        <p className="text-[#9C9C9C] leading-relaxed text-sm">Become part of a growing community of young, driven students and hustlers like you. Share tips, learn together, and stay motivated every step of the way.</p>
                        <div className="flex items-center justify-center w-full">
                            <img
                                src="/assets/fourth.png"
                                alt="art"
                                className="h-52 object-cover"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}