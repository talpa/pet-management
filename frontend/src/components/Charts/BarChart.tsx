import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { commonChartOptions, chartColors } from './ChartConfig';

interface BarChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  color?: string;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ 
  title, 
  data, 
  color = chartColors.primary,
  height = 300 
}) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Počet',
        data: data.map(item => item.value),
        backgroundColor: color + '80', // 50% transparentnost
        borderColor: color,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: height, position: 'relative' }}>
          <Bar data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChart;