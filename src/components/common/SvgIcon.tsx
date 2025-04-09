import React from 'react';

interface SvgIconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  className?: string;
}

// Central map of icon names to their SVG path data or elements
// Add other icons here as needed
const iconRegistry: Record<string, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </>
  ),
  filter: (
    <>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
    </>
  ),
  menu: (
    <>
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </>
  ),
  'more-horizontal': ( // Use quotes for key with hyphen
    <>
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </>
  ),
  'sort-asc': ( // Use quotes for key with hyphen
    <>
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <polyline points="5 12 12 5 19 12"></polyline>
    </>
  ),
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </>
  ),
  'arrow-right': ( // Use quotes for key with hyphen
    <>
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </>
  ),
  'arrow-left': ( // Use quotes for key with hyphen
    <>
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" y1="15" x2="12" y2="3"></line>
    </>
  ),
  'chevron-down': (
    <>
      <polyline points="6 9 12 15 18 9"></polyline>
    </>
  ),
  'chevron-up': (
    <>
      <polyline points="18 15 12 9 6 15"></polyline>
    </>
  ),
  // Add node etc.
};

const SvgIcon: React.FC<SvgIconProps> = ({
  name,
  size = 16, // Default size
  className = '',
  fill = 'none',
  stroke = 'currentColor',
  strokeWidth = 2,
  strokeLinecap = 'round',
  strokeLinejoin = 'round',
  viewBox = '0 0 24 24', // Default viewBox
  ...props
}) => {
  const iconContent = iconRegistry[name];

  if (!iconContent) {
    console.warn(`[SvgIcon] Icon "${name}" not found.`);
    // Return a placeholder or null (Removed HTML comment)
    return <svg width={size} height={size} className={className} viewBox="0 0 24 24" {...props}></svg>;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap={strokeLinecap}
      strokeLinejoin={strokeLinejoin}
      className={className}
      aria-hidden="true" // Good practice for decorative icons
      focusable="false" // Prevent focus on decorative icons
      {...props}
    >
      {iconContent}
    </svg>
  );
};

export default SvgIcon;
