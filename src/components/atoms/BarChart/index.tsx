import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { dynamicColors, generateOptions } from "@constants";
import type { ChartProps } from "@types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type BarChartProps = {
  suggestYAxisMin?: number;
  suggestYAxisMax?: number;
  stepSize?: number;
} & ChartProps;

const BarChart = ({
  labels,
  datasets,
  suggestYAxisMax,
  suggestYAxisMin,
  title,
  stepSize,
}: BarChartProps) => {
  const options = {
    ...generateOptions(title),
    barPercentage: 0.8, // Space between bars within the same category
    categoryPercentage: 0.6, // Space between categories
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
    locale: "es",
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

  return <Bar data={data} options={options} />;
};

export default BarChart;
