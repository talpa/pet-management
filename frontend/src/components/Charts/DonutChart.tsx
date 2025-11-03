import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { pieChartOptions, chartColors } from './ChartConfig';

interface DonutChartProps {
  title: string;
  data: Array<{ label: string; value: number }>;
  height?: number;
  centerText?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({ 
  title, 
  data, 
  height = 300,
  centerText
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
        cutout: '60%',
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
          <Doughnut data={chartData} options={options} />
          {centerText && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {centerText}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Celkem
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DonutChart;