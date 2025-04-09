import React, { useState, useRef, useEffect } from "react";
import SvgIcon from "components/common/SvgIcon"; // Assuming this path is correct

interface IssueDetailsBannerProps {
  mainNode: string;
  degradationPercentage: number;
  application: string;
  vlan: string;
  codec: string;
  availableLocations: string[];
  onLocationChange: (locationName: string) => void;
}

const IssueDetailsBanner: React.FC<IssueDetailsBannerProps> = ({
  mainNode,
  degradationPercentage,
  application,
  vlan,
  codec,
  availableLocations,
  onLocationChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLocationSelect = (location: string) => {
    onLocationChange(location);
    setDropdownOpen(false);
  };
  const listIconName = "list"; // Example: Replace with your actual icon name for 'list'/'view'

  return (
    // Main container with padding and border
    <div className="bg-white text-black py-3 pb-0 px-6">
      {/* Top Section: Title and Details */}
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          {degradationPercentage}% MoS Degradation leaving {mainNode}
        </h2>
        <div className="text-xs text-gray-500 mt-1">
          Application: {application} | VLAN: {vlan} | Codec: {codec}
        </div>
      </div>

      {/* Bottom Section: Sort Controls with Dropdown */}
      <div className="flex items-center space-x-3 text-gray-600">
        <button className="hover:text-black">
          <SvgIcon name={listIconName} size={16} />
        </button>

        {/* Dropdown Component */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button" // Add type="button"
            onClick={toggleDropdown}
            className="flex items-center text-xs font-medium text-gray-700 px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            <span>Sort By: Impact from {mainNode}</span>
            <SvgIcon name={dropdownOpen ? "chevron-up" : "chevron-down"} size={14} className="ml-1" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-1 w-48 bg-white rounded shadow-lg z-10 py-1 border border-gray-200">
              {availableLocations.map((location) => (
                <button
                  type="button" // Add type="button"
                  key={location}
                  className={`block w-full text-left px-4 py-2 text-xs ${
                    location === mainNode ? "bg-gray-100 font-medium" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleLocationSelect(location)}
                >
                  Impact from {location}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsBanner;
