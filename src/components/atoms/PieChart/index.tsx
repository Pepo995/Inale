import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { dynamicColors, generateOptions } from "@constants";
import type { ChartProps } from "@types";

ChartJS.register(ArcElement, Tooltip, Legend);

type PieChartProps = {
  separation?: number;
} & ChartProps;

const PieChart = ({
  labels,
  datasets,
  title,
  separation = 0,
}: PieChartProps) => {
  const options = {
    ...generateOptions(title),
  };
  const data = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      backgroundColor: dynamicColors,
      borderWidth: separation,
      borderColor: "transparent",
      tension: 0.4,
    })),
  };

  return <Pie data={data} options={options} />;
};

export default PieChart;
