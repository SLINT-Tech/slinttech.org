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
    <div className="space-y-6 bg-white dark:bg-slate-900 dark:border dark:border-slate-800 p-5 rounded-xl transition-colors">
        <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover rounded-lg"
        />
        <div className="flex items-center space-x-3">
            {/* <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                {icon}
            </div> */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-[#9C9C9C] dark:text-gray-400 leading-relaxed text-sm">{description}</p>
    </div>
);

export default FeaturesSectionCard;