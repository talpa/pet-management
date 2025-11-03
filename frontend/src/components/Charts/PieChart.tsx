import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { pieChartOptions, chartColors } from './ChartConfig';

interface PieChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  height?: number;
}

const PieChart: React.FC<PieChartProps> = ({ 
  title, 
  data, 
  height = 300 
}) => {
  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: 'Počet',
        data: data.map(item => item.value),
        backgroundColor: chartColors.gradient.slice(0, data.length),
        borderColor: chartColors.gradient.slice(0, data.length),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    ...pieChartOptions,
    plugins: {
      ...pieChartOptions.plugins,
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
          <Pie data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChart;