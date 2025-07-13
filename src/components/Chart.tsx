import React from 'react';
import { Line } from 'react-chartjs-2';
import { ChartData } from 'chart.js';

interface ChartProps {
    data: ChartData<'line', number[], string>;
}

const Chart: React.FC<ChartProps> = ({ data }) => {
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
            <Line data={data} options={chartOptions} />
        </div>
    );
};

export default Chart;
