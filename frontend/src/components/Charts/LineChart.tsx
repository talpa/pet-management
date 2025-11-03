import React from 'react';
import { Line } from 'react-chartjs-2';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { commonChartOptions, chartColors } from './ChartConfig';

interface LineChartProps {
  title: string;
  data: Array<{ label: string; value: number; secondaryValue?: number }>;
  height?: number;
  showSecondaryLine?: boolean;
  secondaryLabel?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  title, 
  data, 
  height = 300,
  showSecondaryLine = false,
  secondaryLabel = 'Druhá hodnota'
}) => {
  const datasets = [
    {
      label: 'Návštěvy',
      data: data.map(item => item.value),
      borderColor: chartColors.primary,
      backgroundColor: chartColors.primary + '20',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: chartColors.primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    }
  ];

  if (showSecondaryLine && data.some(item => item.secondaryValue !== undefined)) {
    datasets.push({
      label: secondaryLabel,
      data: data.map(item => item.secondaryValue || 0),
      borderColor: chartColors.secondary,
      backgroundColor: chartColors.secondary + '20',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: chartColors.secondary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
    });
  }

  const chartData = {
    labels: data.map(item => item.label),
    datasets,
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
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ height: height, position: 'relative' }}>
          <Line data={chartData} options={options} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default LineChart;