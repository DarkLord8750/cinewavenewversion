import { useEffect } from 'react';
import { BarChart as BarChartIcon, TrendingUp, Users, Film, Activity } from 'lucide-react';
import { useAnalyticsStore } from '../../stores/analyticsStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const { data, isLoading, error, fetchAnalytics } = useAnalyticsStore();

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Error loading analytics: {error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome back, Admin</h1>
        <p className="text-gray-500">Here's what's happening with your Netflix platform today.</p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 mb-1">Total Users</p>
              <h3 className="text-3xl font-bold text-gray-800">{data.totalUsers}</h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp size={14} className="mr-1" /> 
                <span>Active growth</span>
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 mb-1">Total Content</p>
              <h3 className="text-3xl font-bold text-gray-800">{data.totalContent}</h3>
              <p className="text-xs text-green-600 mt-2 flex items-center">
                <TrendingUp size={14} className="mr-1" /> 
                <span>Growing library</span>
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Film className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 mb-1">Active Sessions</p>
              <h3 className="text-3xl font-bold text-gray-800">{data.activeSessions}</h3>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Activity size={14} className="mr-1" /> 
                <span>Currently streaming</span>
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <Activity className="text-netflix-red" size={24} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">User Growth</h3>
          <div className="h-80">
            {data.userGrowth.length > 0 ? (
              <div className="relative h-full">
                <div className="absolute inset-0 flex items-end">
                  {data.userGrowth.map((point, index) => {
                    const height = `${(point.count / Math.max(...data.userGrowth.map(p => p.count))) * 100}%`;
                    return (
                      <div
                        key={point.date}
                        className="flex-1 flex flex-col items-center group"
                      >
                        <div className="w-full px-1">
                          <div
                            className="w-full bg-netflix-red rounded-t transition-all duration-300 group-hover:bg-netflix-red/80"
                            style={{ height }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                          {new Date(point.date).toLocaleDateString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No user growth data available</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Content Popularity</h3>
          <div className="h-80">
            {data.contentPopularity.length > 0 ? (
              <div className="space-y-4">
                {data.contentPopularity.map((content) => (
                  <div key={content.title} className="relative">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate">{content.title}</span>
                      <span className="text-gray-500">{content.views} views</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-netflix-red rounded-full"
                        style={{
                          width: `${(content.views / Math.max(...data.contentPopularity.map(c => c.views))) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <p>No content popularity data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="flow-root">
            <ul className="-mb-8">
              {data.recentActivity.map((activity, index) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {index !== data.recentActivity.length - 1 ? (
                      <span
                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex items-start space-x-3">
                      <div>
                        <div className="relative p-2 rounded-full bg-netflix-red bg-opacity-10 flex items-center justify-center">
                          <Activity size={16} className="text-netflix-red" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-2 text-sm text-gray-700">
                          <p>{activity.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;