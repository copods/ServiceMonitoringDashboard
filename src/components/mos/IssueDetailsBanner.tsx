import React from "react";
import SvgIcon from "components/common/SvgIcon"; // Import SvgIcon

interface IssueDetailsBannerProps {
  mainNode: string;
  degradationPercentage: number;
  application: string;
  vlan: string;
  codec: string;
}

// Removed local icon definitions

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

        {/* Right Side: Sort Controls using SvgIcon */}
        <div className="flex items-center space-x-3 text-gray-600">
          <button className="hover:text-black">
            <SvgIcon name="sort-asc" size={16} />
          </button>
          <button className="hover:text-black">
            <SvgIcon name="list" size={16} />
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
