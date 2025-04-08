import React from 'react';
import { RouteDetails, HistoricalData } from '../../types/mos';
import RouteHistoricalChart from './RouteHistoricalChart';

interface RouteDetailPanelProps {
  routeDetails: RouteDetails;
  historicalData: HistoricalData[];
  sourceLocationName: string;
  destinationLocationName: string;
}

const RouteDetailPanel: React.FC<RouteDetailPanelProps> = ({
  routeDetails,
  historicalData,
  sourceLocationName,
  destinationLocationName
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm h-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {sourceLocationName} to {destinationLocationName}
        </h2>
      </div>

      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Forward Path Metrics */}
          <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {sourceLocationName} → {destinationLocationName} Path
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded p-2 shadow-sm">
                <div className="text-xs text-gray-500">MOS</div>
                <div className="text-lg font-bold" style={{ color: routeDetails.forwardPath.mosPercentage < 50 ? '#ef4444' : '#3b82f6' }}>
                  {routeDetails.forwardPath.mosPercentage}%
                </div>
              </div>
              
              <div className="bg-white rounded p-2 shadow-sm">
                <div className="text-xs text-gray-500">Packet Loss</div>
                <div className="text-lg font-bold text-orange-500">
                  {routeDetails.forwardPath.packetLossPercentage.toFixed(1)}%
                </div>
              </div>
              
              <div className="bg-white rounded p-2 shadow-sm">
                <div className="text-xs text-gray-500">Streams</div>
                <div className="text-lg font-bold text-gray-700">
                  {(routeDetails.forwardPath.streamCount / 1000).toFixed(0)}k
                </div>
              </div>
              
              <div className="bg-white rounded p-2 shadow-sm">
                <div className="text-xs text-gray-500">Impacted</div>
                <div className="text-lg font-bold text-red-500">
                  {routeDetails.forwardPath.impactPercentage}%
                </div>
              </div>
            </div>
          </div>
          
          {/* Return Path Metrics */}
          <div className="border border-gray-200 rounded-lg p-4 bg-purple-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {destinationLocationName} → {sourceLocationName} Path
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded p-2 shadow-sm">
                <div className="text-xs text-gray-500">MOS</div>
                <div className="text-lg font-bold text-blue-500">
                  {routeDetails.returnPath.mosPercentage}%
                </div>
              </div>
              
              <div className="bg-white rounded p-2 shadow-sm">
                <div className="text-xs text-gray-500">Streams</div>
                <div className="text-lg font-bold text-gray-700">
                  {(routeDetails.returnPath.streamCount / 1000).toFixed(0)}k
                </div>
              </div>
              
              <div className="bg-white rounded p-2 shadow-sm col-span-2">
                <div className="text-xs text-gray-500">Impacted</div>
                <div className="text-lg font-bold text-orange-500">
                  {routeDetails.returnPath.impactPercentage}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Analysis */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Analysis ({destinationLocationName})
        </h3>
        
        <div className="text-sm text-gray-600 space-y-2">
          <p>{routeDetails.analysis.impactedStreamsPercentage}% of streams reaching {destinationLocationName} are impacted.</p>
          <p>Out of all the streams that reach {destinationLocationName}, {routeDetails.analysis.sourceToDestPercentage}% come from {sourceLocationName}.</p>
          <p>{routeDetails.analysis.overlapAnalysis}</p>
        </div>
      </div>
      
      {/* Additional Statistics */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Additional Statistics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
            <div className="text-xs text-gray-500">{sourceLocationName} MOS</div>
            <div className="text-lg font-bold text-blue-500">
              {routeDetails.additionalStats.sourceMOS}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
            <div className="text-xs text-gray-500">{sourceLocationName} PL</div>
            <div className="text-lg font-bold text-orange-500">
              {routeDetails.additionalStats.sourcePacketLoss}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
            <div className="text-xs text-gray-500">{destinationLocationName} MOS</div>
            <div className="text-lg font-bold text-blue-500">
              {routeDetails.additionalStats.destinationMOS}%
            </div>
          </div>
          
          <div className="bg-gray-50 rounded p-2 text-center border border-gray-200">
            <div className="text-xs text-gray-500">{destinationLocationName} PL</div>
            <div className="text-lg font-bold text-orange-500">
              {routeDetails.additionalStats.destinationPacketLoss}%
            </div>
          </div>
        </div>
        
        {/* Historical Chart */}
        <div className="border border-gray-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            {sourceLocationName} ↔ {destinationLocationName} Overtime View
          </h3>
          
          <div className="h-60">
            <RouteHistoricalChart data={historicalData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailPanel;
