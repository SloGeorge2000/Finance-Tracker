import React from 'react';
import { Bar } from 'react-chartjs-2';
import { ChartData } from 'chart.js';

interface BarChartProps {
    data: ChartData<'bar', number[], string>;
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    const chartOptions = {
        responsive: true,
        scales: {
            x: {
                type: 'category' as const,
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div>
            <h2>Financial Progress</h2>
            <Bar data={data} options={chartOptions} />
        </div>
    );
};

export default BarChart;
