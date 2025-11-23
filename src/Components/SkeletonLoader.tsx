export const TableSkeletonLoader = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeletonLoader = () => {
  return (
    <div className="animate-pulse bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-32"></div>
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
