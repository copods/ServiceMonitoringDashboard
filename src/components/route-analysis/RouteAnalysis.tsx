import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import RouteStatisticsChart from 'components/charts/statistics/RouteStatisticsChart'; // Ensure this path is correct later

interface RouteAnalysisProps {
  width: number;
  height: number; // Height might not be directly used but passed for consistency
}

const RouteAnalysis: React.FC<RouteAnalysisProps> = ({ width }) => { // Height removed as it's not used directly
  const { selectedRoute, locations, statistics } = useSelector((state: RootState) => state.network);
  
  if (!selectedRoute) {
    return (
      <div className="bg-gray-800 p-6 rounded h-full flex items-center justify-center"> {/* Added height and centering */}
        <p className="text-center text-gray-400">
          Select a route from the network flow chart to view detailed analysis
        </p>
      </div>
    );
  }
  
  const { forwardRoute, reverseRoute, overlapAnalysis } = selectedRoute;
  
  const sourceLocation = locations.find(loc => loc.id === forwardRoute.sourceId);
  const destinationLocation = locations.find(loc => loc.id === forwardRoute.destinationId);
  
  if (!sourceLocation || !destinationLocation) {
    return <div className="bg-gray-800 p-6 rounded text-red-500">Error: Location data not found for the selected route</div>;
  }

  return (
    <div className="bg-gray-800 p-4 rounded route-analysis h-full flex flex-col"> {/* Adjusted padding */}
      <h3 className="text-xl font-semibold mb-3 text-white">
        {sourceLocation.name} to {destinationLocation.name}
      </h3>
      
      {/* Impact percentages section (Denver to Pune) - Matching design image */}
      <div className="bg-gray-700 p-3 rounded mb-4">
        <div className="flex items-center justify-between">
          {/* Left side (Denver) with MoS percentage */}
          <div className="text-center">
            <div className="text-sm text-gray-300 mb-1">37% MoS</div>
            <div className="text-xs text-gray-400">84.5% PL</div>
          </div>
          
          {/* Middle streams indicator */}
          <div className="relative">
            {/* First progress bar - match design */}
            <div className="flex items-center mb-6">
              <div className="relative mr-2">
                <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-xs text-white">37</span>
                </div>
              </div>
              <div className="w-24 h-[2px] bg-gray-500 relative">
                <div className="absolute top-0 left-0 h-[2px] bg-gray-400 w-full"></div>
              </div>
              <div className="text-xs text-gray-400 mx-2">50% Impacted</div>
              <div className="w-24 h-[2px] bg-gray-500"></div>
              <div className="relative ml-2">
                <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-xs text-white">80</span>
                </div>
              </div>
            </div>
            
            {/* Second progress bar - match design */}
            <div className="flex items-center">
              <div className="relative mr-2">
                <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-xs text-white">44</span>
                </div>
              </div>
              <div className="w-24 h-[2px] bg-gray-500 relative">
                <div className="absolute top-0 left-0 h-[2px] bg-gray-400 w-full"></div>
              </div>
              <div className="text-xs text-gray-400 mx-2">50% Impacted</div>
              <div className="w-24 h-[2px] bg-gray-500"></div>
              <div className="relative ml-2">
                <div className="w-6 h-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                  <span className="text-xs text-white">54</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side (Pune) with MoS percentage */}
          <div className="text-center">
            <div className="text-sm text-gray-300 mb-1">90% MoS</div>
            <div className="text-xs text-gray-400">55% PL</div>
          </div>
        </div>
      </div>
      
      {/* Impact Analysis Text */}
      <div className="bg-gray-700 p-3 rounded mb-4">
        <p className="text-gray-300 text-sm">
          90% of streams reaching Pune are impacted. Out of all the streams that reach Pune, 7% come from Denver. It is inconclusive to say that there is an overlap between the impacted streams and streams coming from Denver.
        </p>
      </div>
      
      {/* Statistics Chart */}
      <div className="bg-gray-700 p-3 rounded flex-grow flex flex-col"> {/* Reduced padding */}
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-white">Additional Statistics</h4>
          <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded"> {/* Adjusted styling */}
            Overtime View
          </button>
        </div>
        <div className="flex justify-center flex-grow statistics-chart">
          <RouteStatisticsChart 
            sourceLocation={sourceLocation}
            destinationLocation={destinationLocation}
            statistics={statistics}
            width={width - 60} // Adjusted width calculation based on padding
            height={200} // Adjusted height to match design
          />
        </div>
      </div>
    </div>
  );
};

export default RouteAnalysis;
