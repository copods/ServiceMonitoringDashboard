# Service Monitoring Dashboard

A real-time dashboard for monitoring service health and performance across multiple domains. This application provides a comprehensive visualization of service metrics, allowing engineers and system administrators to quickly identify and resolve critical issues.


## Features

- **Domain Overview**: View summary metrics for each domain including total services and critical issues
- **Polar Visualization**: Analyze service health and importance with an interactive bubble chart
- **Critical Services Monitoring**: Track the 6 most critical services with 24-hour activity visualization
- **Service List**: Browse all services with detailed metrics and status indicators
- **Simulated Real-Time Updates**: Receive live updates of service metrics via built-in mock data generation
- **Detailed Service View**: Drill down into detailed service information with performance charts

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **State Management**: Redux with Redux Toolkit
- **Data Visualization**: D3.js
- **Styling**: TailwindCSS
- **Mock Data**: Built-in mock data generation for simulated real-time updates

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/dashboard-app.git
cd dashboard-app
```

2. Install dependencies:
```bash
npm install
```

### Available Scripts

- **`npm start`**: Runs the app in development mode at [http://localhost:3000](http://localhost:3000)
- **`npm run build`**: Builds the app for production to the `build` folder
- **`npm test`**: Launches the test runner in interactive watch mode

### Development Notes

This application uses built-in mock data rather than external APIs:
- All API endpoints are mocked internally
- Real-time updates are simulated with 5-second intervals
- No external server dependencies required

## Application Structure

- **`src/components`**: UI components organized by function
- **`src/store`**: Redux store configuration and slices
- **`src/services`**: API service implementations and mock data
- **`src/hooks`**: Custom React hooks
- **`src/types`**: TypeScript type definitions
- **`mock-server`**: Reference implementation (not required for running the app)

## Learn More

- [React Documentation](https://reactjs.org/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [D3.js Documentation](https://d3js.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)