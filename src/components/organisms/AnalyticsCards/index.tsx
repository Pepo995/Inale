import React from "react";
import type { ReactElement } from "react";
import DashboardCard from "@molecules/DashboardCard";
import Typography from "@atoms/Typography";
import { Percentage } from "@atoms/Percentage";

type analyticsCardsProps = {
  data: Array<{
    title: string;
    icon: ReactElement;
    percentage: number;
    timeSpan: string;
    number: number;
  }>;
};

const AnalyticsCards = ({ data }: analyticsCardsProps) => (
  <div className="grid grid-rows-2 gap-6 md:grid-cols-2">
    {data.map(({ title, percentage, timeSpan, number, icon }, i) => (
      <DashboardCard
        title={title}
        icon={<span className="rounded-full bg-blue-100 p-2">{icon}</span>}
        footer={
          <>
            <Percentage className="mb-1 rounded-sm" percentage={percentage} />
            <Typography color="light">{timeSpan}</Typography>
          </>
        }
        key={`${title} ${i}`}
      >
        <Typography variant="h1" weight="normal">
          {number.toLocaleString()}
        </Typography>
      </DashboardCard>
    ))}
  </div>
);

export default AnalyticsCards;
