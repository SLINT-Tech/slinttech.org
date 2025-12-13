import React from 'react';

interface SkillBadgeProps {
  skill: string;
  isDark?: boolean;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({ skill, isDark }) => {
  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-300 ${
        isDark
          ? 'bg-slate-800 text-slate-300 border border-slate-700'
          : 'bg-slate-100 text-slate-700 border border-slate-200'
      }`}
    >
      {skill}
    </span>
  );
};
