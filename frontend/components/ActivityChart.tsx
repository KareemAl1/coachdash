'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface DayActivity {
  date: string;
  count: string;
}

interface ActivityChartProps {
  data: DayActivity[];
}

// Build a full 7-day range, filling gaps with 0
const buildWeekData = (data: DayActivity[]) => {
  const days: { label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    const found = data.find((entry) => entry.date === dateStr);
    days.push({ label, count: found ? parseInt(found.count) : 0 });
  }
  return days;
};

export default function ActivityChart({ data }: ActivityChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-36 bg-bg-elevated rounded-lg animate-pulse" />;

  const weekData = buildWeekData(data);

  const chartData = {
    labels: weekData.map((d) => d.label),
    datasets: [
      {
        data: weekData.map((d) => d.count),
        backgroundColor: weekData.map((d) =>
          d.count > 0 ? '#7c5cfc' : '#1a1a24'
        ),
        hoverBackgroundColor: '#9b7eff',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a24',
        borderColor: '#2a2a38',
        borderWidth: 1,
        titleColor: '#9090a8',
        bodyColor: '#f0f0f8',
        callbacks: {
          title: (items: { label: string }[]) => items[0].label,
          label: (item: { raw: unknown }) =>
            ` ${item.raw} ${Number(item.raw) === 1 ? 'entry' : 'entries'}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#5a5a70', font: { size: 11 } },
      },
      y: {
        grid: { color: '#1a1a24' },
        border: { display: false },
        ticks: {
          color: '#5a5a70',
          font: { size: 11 },
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ height: '160px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
