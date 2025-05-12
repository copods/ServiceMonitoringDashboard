import React, { useState, useMemo } from "react";
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const labels = ['Team A', 'Team B', 'Team C'];

const datasets = [
    {
        label: 'Goals Scored',
        data: [12, 19, 8],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
    },
    {
        label: 'Assists',
        data: [9, 14, 6],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
    },
    {
        label: 'Fouls',
        data: [3, 5, 2],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
    },
];

const Test: React.FC = () => {
    const [showTooltip, setShowTooltip] = useState(true);

    const data = useMemo(() => ({
        labels,
        datasets,
    }), []);

    const options = useMemo(() => ({
        responsive: true,
        plugins: {
            tooltip: {
                enabled: showTooltip,
                callbacks: {
                    label: (context: any) => {
                        const { dataset, parsed } = context;
                        return `${dataset.label}: ${parsed.y}`;
                    },
                },
            },
            legend: {
                position: 'bottom',
            },
        },
    }), [showTooltip]);

    return (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: 'white' }}>
            <div style={{
                width: '80%',
                height: '80%',
                margin: 'auto',
                backgroundColor: 'white',
                paddingTop: '5%',
            }}>
                <label style={{ display: 'block', marginBottom: '16px', color: 'black' }}>
                    <input
                        type="checkbox"
                        checked={showTooltip}
                        onChange={() => setShowTooltip(prev => !prev)}
                    />
                    &nbsp; Show Tooltip
                </label>
                <Bar data={data} options={options as any} />
            </div>
        </div>
    );
};

export default Test;
