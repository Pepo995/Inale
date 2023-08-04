import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { dynamicColors, generateOptions } from "@constants";
import type { ChartProps } from "@types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type LineChartProps = {
  suggestYAxisMin?: number;
  suggestYAxisMax?: number;
  stepSize?: number;
} & ChartProps;

const LineChart = ({
  labels,
  datasets,
  suggestYAxisMax,
  suggestYAxisMin,
  title,
  stepSize,
}: LineChartProps) => {
  const options = {
    ...generateOptions(title),
    scales: {
      y: {
        grid: {
          display: false,
        },
        ticks: {
          stepSize: stepSize,
        },
        suggestedMin: suggestYAxisMin,
        suggestedMax: suggestYAxisMax,
      },
    },
  };
  const data = {
    labels,
    datasets: datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dynamicColors[index % dynamicColors.length],
      pointBackgroundColor: "transparent",
      borderColor: dynamicColors[index % dynamicColors.length],
      tension: 0.4,
    })),
  };

  return <Line data={data} options={options} />;
};

export default LineChart;
