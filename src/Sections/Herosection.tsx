const HeroSection = () => {
    return (
        <section id="home" className="pt-10 pb-5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">

                    <img
                        src="/assets/education.svg"
                        alt="Education"
                        className="w-16 h-16 mx-auto mb-4"
                    />

                    {/* <div className="rounded-full bg-white/50 px-2 py-1 inline-flex items-center justify-center w-fit  mb-10 mx-auto">
                        <img
                            src="/assets/logos.svg"
                            alt="Trusted"
                            className="h-14"
                        />

                        <div>Trusted by 100+ Businesses and Stores</div>

                    </div> */}

                    <div className="grid grid-cols-[1fr_4fr_1fr]">
                        <img src="/assets/presentation.svg" alt="Hero Image" className="h-12 ml-auto " />

                        <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-gray-900 mb-6">
                            Grow Without <span className="text-[#008080] bg-[#0080800D] rounded-lg px-2">Limits.</span><br />
                            <span className="text-[#008080] bg-[#0080800D] rounded-lg px-2">Upskill</span> Beyond Borders.
                        </h1>

                        <div></div>
                    </div>

                    <div className="grid grid-cols-[1fr_4fr_1fr]">

                        <div></div>
                        <p className="text-md sm:text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                            Training, mentorship, and support you need. We're invested in your future!
                        </p>
                        <img src="/assets/books.svg" alt="Hero Image" className="h-12 " />
                    </div>








                    {/* <div className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-white/50 p-2 rounded-xl shadow-lg w-fit mb-10 mx-auto">

                        <form className="flex flex-col sm:flex-row gap-2 w-full mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-2 bg-transparent min-w-80 rounded-md focus:outline-hidden flex-3"
                                required
                            />
                            <button
                                type="submit"
                                className="px-10 cursor-pointer py-3 flex-1 text-white rounded-lg font-semibold hover:bg-teal-700 transition bg-[linear-gradient(90deg,#333333_0%,#1E1E1E_100%)]"
                            >
                                Sign Up
                            </button>
                        </form>

                    </div> */}
                </div>
            </div>
        </section>
    );
};

export default HeroSection;