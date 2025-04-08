import React from "react";

interface MOSDashboardHeaderProps {
  serviceName: string;
  currentTime: string; // Not used in this static version
  startTime: string; // Not used in this static version
}

// Simple SVG Icon components (replace with your actual icon library if preferred)
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);
const GridIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
  </svg>
); // Adjusted grid icon
const FilterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
); // Filter icon
const LinkIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
  </svg>
);
const MenuIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const MoreHorizontalIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="1"></circle>
    <circle cx="19" cy="12" r="1"></circle>
    <circle cx="5" cy="12" r="1"></circle>
  </svg>
); // More horizontal icon

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

        {/* Right Section: Icons */}
        <div className="flex-none flex items-center space-x-3 text-gray-400">
          <button className="hover:text-white">
            <SearchIcon />
          </button>
          <span className="text-gray-600">|</span>
          <button className="hover:text-white">
            <GridIcon />
          </button>
          <button className="hover:text-white">
            <FilterIcon />
          </button>
          <button className="hover:text-white">
            <LinkIcon />
          </button>
          <span className="text-gray-600">|</span>
          <button className="hover:text-white">
            <MenuIcon />
          </button>
          <button className="hover:text-white">
            <MoreHorizontalIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MOSDashboardHeader;
