export const TableSkeletonLoader = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 transition-colors"></div>
          </div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeletonLoader = () => {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm dark:shadow-gray-900/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg transition-colors"></div>
      </div>
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-2 transition-colors"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 transition-colors"></div>
    </div>
  );
};

export const StatsSkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, index) => (
        <CardSkeletonLoader key={index} />
      ))}
    </div>
  );
};

export const PageLoader = ({ message = 'Loading...' }: { message?: string; }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] dark:bg-gray-950 transition-colors">
      <div className="text-center">
        <svg
          className="animate-spin h-12 w-12 text-[#008080] dark:text-teal-400 mx-auto mb-4 transition-colors"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="text-gray-600 dark:text-gray-400 text-base transition-colors">{message}</p>
      </div>
    </div>
  );
};

export const MentorDetailSkeletonLoader = ({ backLink }: { backLink?: { to: string; label: string; }; }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {backLink && (
        <a
          href={backLink.to}
          className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLink.label}
        </a>
      )}
      <div className="animate-pulse">

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-8 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl transition-colors"></div>
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 transition-colors"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36 transition-colors"></div>
              <div className="flex flex-wrap gap-3">
                <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
                <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
              </div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 transition-colors">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors"></div>
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
            </div>
            <div>
              <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors"></div>
              <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
            </div>
            <div className="md:col-span-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors"></div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors"></div>
              <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
          </div>
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                  <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2 transition-colors"></div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MenteeDetailSkeletonLoader = ({ backLink }: { backLink?: { to: string; label: string; }; }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {backLink && (
        <a
          href={backLink.to}
          className="inline-flex items-center gap-2 text-[#008080] dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLink.label}
        </a>
      )}
      <div className="animate-pulse">

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 mb-8 transition-colors">
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full mr-4 transition-colors"></div>
            <div className="flex-1 space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 transition-colors"></div>
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36 transition-colors"></div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 transition-colors"></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3 transition-colors"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full transition-colors"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 transition-colors"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 transition-colors"></div>
              </div>
            </div>
            <div>
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3 transition-colors"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full transition-colors"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 transition-colors"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6 transition-colors"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
            <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 transition-colors"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors"></div>
            <div className="space-y-3">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 transition-colors"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full transition-colors"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6 transition-colors"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors">
              <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4 transition-colors"></div>
              <div className="grid grid-cols-2 gap-4">
                {[...Array(2)].map((_, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-colors">
                    <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 transition-colors"></div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mx-auto transition-colors"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CourseDetailSkeletonLoader = ({ backLink }: { backLink?: { to: string; label: string; }; }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {backLink && (
        <a
          href={backLink.to}
          className="inline-flex items-center gap-2 text-[#008080] hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 mb-6 transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backLink.label}
        </a>
      )}
      <div className="animate-pulse">

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm p-6 md:p-8 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
          <div className="mb-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2 transition-colors"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 transition-colors"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 transition-colors"></div>
            <div className="flex flex-wrap gap-3">
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
              <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
              <div className="h-8 w-36 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mt-2 transition-colors"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
              </div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0 transition-colors"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full transition-colors"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 transition-colors"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 transition-colors">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"></div>
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full transition-colors"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CourseCardSkeletonLoader = () => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 transition-colors"></div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 transition-colors"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 transition-colors"></div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 transition-colors"></div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 transition-colors">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1 transition-colors"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 transition-colors"></div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 transition-colors">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1 transition-colors"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12 transition-colors"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800 transition-colors">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 transition-colors"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 transition-colors"></div>
      </div>
    </div>
  );
};

export const NotificationSkeletonLoader = ({ count = 10 }: { count?: number; }) => {
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {[...Array(count)].map((_, index) => (
        <div key={index} className="px-4 sm:px-6 py-4 flex items-start gap-4 animate-pulse bg-white dark:bg-gray-900 transition-colors">
          {/* Icon skeleton */}
          <div className="shrink-0">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"></div>
          </div>

          {/* Content skeleton */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 transition-colors"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full transition-colors"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 transition-colors"></div>
              </div>
              {/* Action button skeleton */}
              <div className="shrink-0 flex items-center gap-1">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const MentorCoursesTableSkeletonLoader = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-gray-900/30 p-6 md:p-8 mb-8 border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl transition-colors"></div>
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 transition-colors"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-36 transition-colors"></div>
            <div className="flex flex-wrap gap-3">
              <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
              <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg transition-colors"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 transition-colors"></div>
        <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"></div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 transition-colors">
              <tr>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 transition-colors"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 transition-colors"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 transition-colors"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-14 transition-colors"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 transition-colors"></div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 transition-colors"></div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 transition-colors">
              {[...Array(5)].map((_, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-40 transition-colors"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-56 transition-colors"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10 transition-colors"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10 transition-colors"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-10 transition-colors"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded transition-colors"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 transition-colors"></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 transition-colors"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
