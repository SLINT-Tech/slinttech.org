import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React from "react";

const NewsletterSection: React.FC = () => {
    const navigate = useNavigate();

    const handleJoinCommunity = () => {
        navigate('/signup');
    };

    return (
        <section
            id="community"
            className="relative overflow-hidden bg-[linear-gradient(100deg,#008080_0%,#00a3a3_100%)] py-20"
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_120%_at_85%_10%,rgba(255,255,255,0.18),transparent_60%)]"
            />

            <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
                <div className="max-w-2xl">
                    <span className="text-xs font-semibold tracking-[0.18em] text-white/70 uppercase">
                        Join our community
                    </span>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                        Your mentor is one step away
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed text-white/85">
                        Create an account and we will match you with a mentor working in
                        the field you want to move into.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleJoinCommunity}
                    className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold whitespace-nowrap text-[#008080] transition hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#008080] focus-visible:outline-none"
                >
                    Create your account
                    <ArrowRight className="h-5 w-5" />
                </button>
            </div>
        </section>
    );
};

export default NewsletterSection;
