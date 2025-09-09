import React from "react";

const MissionVisionSection: React.FC = () => (
    <section className="my-10 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="py-12 bg-white rounded-xl px-8">
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Vision */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Vision</h2>
                    <p className="text-gray-600 leading-relaxed">
                        To empower a new generation of selfless, innovative leaders, united in their
                        commitment to transform society through technology, integrity, and a deep sense of purpose.
                        We envision a future where young minds are equipped to break barriers, challenge the status
                        quo, and lead with courage, using their skills to create a prosperous society that uplifts and serves communities.
                    </p>
                </div>

                {/* Mission */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
                    <p className="text-gray-600 leading-relaxed">
                        Our mission is to create a community of young people passionate about learning and building
                        together. Through hands-on coding education, mentorship, and values-driven leadership
                        training, SLINT Tech seeks to equip youth with technical skills, a growth-oriented mindset, and
                        a commitment to ethical innovation. By fostering a deep sense of responsibility, faith, and
                        national pride, we aim to nurture individuals who will actively contribute to the
                        world, uphold the truth, and inspire positive change for a brighter tomorrow.
                    </p>
                </div>
            </div>
        </div>
    </section>
);

export default MissionVisionSection;