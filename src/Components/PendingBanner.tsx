import { Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PendingBannerProps {
  role: 'Mentee' | 'Mentor';
}

const PendingBanner = ({ role }: PendingBannerProps) => {
  return (
    <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 dark:from-amber-500 dark:via-amber-400 dark:to-yellow-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-amber-600/20 dark:bg-amber-800/30 rounded-full">
              <Clock className="w-4 h-4 text-amber-800 dark:text-amber-900" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-semibold text-amber-900 dark:text-amber-900 text-sm sm:text-base">
                Account Under Review
              </span>
              <span className="text-amber-800 dark:text-amber-800 text-xs sm:text-sm hidden sm:inline">
                |
              </span>
              <span className="text-amber-800 dark:text-amber-800 text-xs sm:text-sm">
                You're viewing a preview of your {role.toLowerCase()} dashboard
              </span>
            </div>
          </div>
          <Link
            to="/pending-approval"
            className="flex items-center gap-1 text-amber-900 dark:text-amber-900 hover:text-amber-950 dark:hover:text-amber-950 font-medium text-sm whitespace-nowrap transition-colors group"
          >
            <span className="hidden sm:inline">Learn more</span>
            <span className="sm:hidden">Details</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingBanner;
