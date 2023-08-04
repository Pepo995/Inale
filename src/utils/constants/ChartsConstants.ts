export const dynamicColors = [
  "rgba(76, 123, 214, 0.5)",
  "rgba(223, 226, 229, 1)",
  "rgba(88, 184, 143, 1)",
  "rgba(255, 99, 132, 0.5)",
  "rgba(242, 188, 77, 1)",
  "rgba(203, 68, 74, 1)",
  "rgba(153, 102, 255, 0.5)",
  "rgba(176, 123, 214, 0.5)",
  "rgba(23, 226, 229, 1)",
  "rgba(188, 184, 143, 1)",
  "rgba(55, 99, 132, 0.5)",
  "rgba(42, 188, 77, 1)",
  "rgba(3, 68, 74, 1)",
  "rgba(53, 102, 255, 0.5)",
  "rgba(42, 88, 77, 1)",
  "rgba(3, 168, 74, 1)",
  "rgba(53, 2, 255, 0.5)",
];

export const generateOptions = (title?: string) => ({
  plugins: {
    title: {
      display: !!title,
      text: title,
      align: "start" as const,
      color: "rgba(153, 153, 153, 1)",
      padding: {
        bottom: 30,
      },
    },
    legend: {
      display: true,
      align: "end" as const,
      position: "bottom" as const,
    },
    responsive: true,
    resizeDelay: 10,
    maintainAspectRatio: false,
  },
});
