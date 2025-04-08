import React from "react";

interface IssueDetailsBannerProps {
  mainNode: string;
  degradationPercentage: number;
  application: string;
  vlan: string;
  codec: string;
}

// Icons for Sort Controls
const SortAscIcon = () => (
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
    <line x1="12" y1="19" x2="12" y2="5"></line>
    <polyline points="5 12 12 5 19 12"></polyline>
  </svg>
);
const ListIcon = () => (
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
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const IssueDetailsBanner: React.FC<IssueDetailsBannerProps> = ({
  mainNode,
  degradationPercentage,
  application,
  vlan,
  codec,
}) => {
  return (
    // White background, black text, padding, bottom border
    <div className="bg-white text-black py-3 px-6 border-b border-gray-200">
      <div className="flex items-center justify-between">
        {/* Left Side: Title and Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {" "}
            {/* Slightly smaller, bolder */}
            {degradationPercentage}% MoS Degradation leaving {mainNode}
          </h2>
          <div className="text-xs text-gray-500 mt-1">
            {" "}
            {/* Smaller text */}
            Application: {application} | VLAN: {vlan} | Codec: {codec}
          </div>
        </div>

        {/* Right Side: Sort Controls */}
        <div className="flex items-center space-x-3 text-gray-600">
          <button className="hover:text-black">
            <SortAscIcon />
          </button>
          <button className="hover:text-black">
            <ListIcon />
          </button>
          <div className="text-xs font-medium text-gray-700">
            Sort By: Impact from Denver &#9662; {/* Arrow down */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsBanner;
