import React from "react";
import SvgIcon from "components/common/SvgIcon"; // Assuming this path is correct

interface MOSDashboardHeaderProps {
  serviceName: string;
}

const MOSDashboardHeader: React.FC<MOSDashboardHeaderProps> = ({
  serviceName,
}) => {
  // Static data
  const time1 = { date: "08 12 14", time: "06:30 pm IST" };
  const time2 = { date: "08 12 14", time: "07:30 pm IST" };
  const yesterdayLabel = "Yesterday";
  const shiftLabel = "shift by";
  const shiftValue = "30 min";
  const viewLabel = "View Default";

  // Define the clip-path
  const slantClipPath = "polygon(48% 0, 100% 0, 100% 100%, 52% 100%)";

  // Define reusable classes for the THICK vertical separators (borders)
  // Use self-stretch for full height
  const thickSeparatorClasses = "bg-white opacity-50 w-[1.5px] self-stretch";

  return (
    <div className="relative border-b border-gray-700 py-3 pr-4 text-white overflow-hidden">
      {/* Background layers */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: "#123141" }}
      ></div>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundColor: "#2E4A56",
          clipPath: slantClipPath,
          WebkitClipPath: slantClipPath,
        }}
      ></div>

      {/* Content */}
      <div className="flex justify-between items-center relative z-10">
        {/* Left Section */}
        <div className="flex-none">
          <h1 className="text-lg font-medium text-white">{serviceName}</h1>
        </div>

        {/* Center Section: Time Controls - Use items-stretch for self-stretch on borders */}
        {/* Restore space-x-6 for spacing between blocks */}
        <div className="flex-grow flex justify-center items-stretch space-x-6 text-xs">

          {/* NEW: Thick Separator "Border" Before Block 1 */}
          <div className={thickSeparatorClasses}></div>

          {/* Time Block 1 - Restored original structure with thin span separator */}
          <div className="flex items-center space-x-3">
            <div className="text-left leading-tight">
              <span className="block text-white">{time1.date}</span>
              <span className="block text-white">{time1.time}</span>
            </div>
            {/* Original thin separator */}
            <span className="text-white opacity-50">|</span>
            <button className="px-2 py-0.5 text-xs hover:bg-[#0c1e2e]/70 rounded-sm text-white">
              {yesterdayLabel}
            </button>
            <span className="text-white opacity-50">|</span>
          </div>

          {/* Time Block 2 - Restored original structure with thin span separator */}
          <div className="flex items-center space-x-3">
            <div className="text-center leading-tight">
              <span className="block text-white">{shiftLabel}</span>
            </div>
            {/* Original thin separator */}
            <button className="px-2 py-0.5 text-xs hover:bg-[#0c1e2e]/70 rounded-sm text-white">
              {shiftValue}
            </button>
            <span className="text-white opacity-50">|</span>
          </div>

          {/* Time Block 3 - Restored original structure with thin span separator */}
          <div className="flex items-center space-x-3">
            <div className="text-right leading-tight">
              <span className="block text-white">{time2.date}</span>
              <span className="block text-white">{time2.time}</span>
            </div>
            {/* Original thin separator */}
            <div className={thickSeparatorClasses}></div>
            <button className="px-2 py-0.5 text-xs hover:bg-[#0c1e2e]/70 rounded-sm text-white">
              {viewLabel}
            </button>
          </div>
        </div>

        {/* Right Section: Icons using SvgIcon - Unchanged */}
        <div className="flex-none flex items-center space-x-3 text-white">
          <button className="hover:text-white/80">
            <SvgIcon name="search" size={16} />
          </button>
          <span className="text-white opacity-50">|</span>
          <button className="hover:text-white/80">
            <SvgIcon name="grid" size={16} />
          </button>
          <button className="hover:text-white/80">
            <SvgIcon name="filter" size={16} />
          </button>
          <button className="hover:text-white/80">
            <SvgIcon name="link" size={16} />
          </button>
          <span className="text-white opacity-50">|</span>
          <button className="hover:text-white/80">
            <SvgIcon name="menu" size={16} />
          </button>
          <button className="hover:text-white/80">
            <SvgIcon name="more-horizontal" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MOSDashboardHeader;