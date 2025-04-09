import React from "react";
import SvgIcon from "components/common/SvgIcon"; // Import the new icon component

interface MOSDashboardHeaderProps {
  serviceName: string;
  // currentTime and startTime removed as they were unused
}

// Removed local SVG Icon components

const MOSDashboardHeader: React.FC<MOSDashboardHeaderProps> = ({
  serviceName,
}) => {
  // Static data matching the screenshot header
  const time1 = { date: "08 12 14", time: "06:30 pm IST" };
  const time2 = { date: "08 12 14", time: "07:30 pm IST" };
  const yesterdayLabel = "Yesterday";
  const shiftLabel = "shift by";
  const shiftValue = "30 min";
  const viewLabel = "View Default";

  return (
    // Dark background, bottom border, padding
    <div className="bg-[#0c1e2e] border-b border-gray-700 py-2 px-4 text-white">
      <div className="flex justify-between items-center">
        {/* Left Section: Service Name */}
        <div className="flex-none">
          <h1 className="text-lg font-medium">{serviceName}</h1>{" "}
          {/* Slightly smaller */}
        </div>

        {/* Center Section: Time Controls */}
        <div className="flex-grow flex justify-center items-center space-x-6 text-xs">
          {/* Time Block 1 */}
          <div className="flex items-center space-x-2">
            <div className="text-center leading-tight">
              <span className="block text-gray-400">{time1.date}</span>
              <span className="block text-gray-400">{time1.time}</span>
            </div>
            <span className="text-gray-600">|</span>
            <button className="px-2 py-0.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-sm border border-gray-600">
              {yesterdayLabel} &#9662; {/* Arrow down */}
            </button>
          </div>

          {/* Time Block 2 */}
          <div className="flex items-center space-x-2">
            <div className="text-center leading-tight">
              <span className="block text-gray-400">{shiftLabel}</span>
              <span className="block text-gray-400">{shiftValue}</span>
            </div>
            <span className="text-gray-600">|</span>
            <button className="px-2 py-0.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-sm border border-gray-600">
              {shiftValue} &#9662; {/* Arrow down */}
            </button>
          </div>

          {/* Time Block 3 */}
          <div className="flex items-center space-x-2">
            <div className="text-center leading-tight">
              <span className="block text-gray-400">{time2.date}</span>
              <span className="block text-gray-400">{time2.time}</span>
            </div>
            <span className="text-gray-600">|</span>
            <button className="px-2 py-0.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-sm border border-gray-600">
              {viewLabel} &#9662; {/* Arrow down */}
            </button>
          </div>
        </div>

        {/* Right Section: Icons using SvgIcon */}
        <div className="flex-none flex items-center space-x-3 text-gray-400">
          <button className="hover:text-white">
            <SvgIcon name="search" size={16} />
          </button>
          <span className="text-gray-600">|</span>
          <button className="hover:text-white">
            <SvgIcon name="grid" size={16} />
          </button>
          <button className="hover:text-white">
            <SvgIcon name="filter" size={16} />
          </button>
          <button className="hover:text-white">
            <SvgIcon name="link" size={16} />
          </button>
          <span className="text-gray-600">|</span>
          <button className="hover:text-white">
            <SvgIcon name="menu" size={16} />
          </button>
          <button className="hover:text-white">
            <SvgIcon name="more-horizontal" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MOSDashboardHeader;
