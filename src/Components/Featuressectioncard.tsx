import React from "react";

interface FeaturesSectionCardProps {
    image: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FeaturesSectionCard: React.FC<FeaturesSectionCardProps> = ({
    image,
    icon,
    title,
    description,
}) => (
    <div className="space-y-6 bg-white p-5 rounded-xl shadow-xs">
        <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover rounded-lg"
        />
        <div className="flex items-center space-x-3">
            {/* <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {icon}
            </div> */}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-[#9C9C9C] leading-relaxed text-sm">{description}</p>
    </div>
);

export default FeaturesSectionCard;