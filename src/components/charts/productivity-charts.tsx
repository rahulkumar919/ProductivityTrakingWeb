"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";

function ChartFrame({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  if (!mounted) return <div className="h-72 rounded-md bg-muted" />;
  return <div className="h-72 min-w-0">{children}</div>;
}

export function ProductivityArea({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="productivity" stroke="#16614f" fill="#5ec4a8" fillOpacity={0.3} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function HoursBar({ data }: { data: Array<Record<string, string | number>> }) {
  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="coding" fill="#16614f" radius={[4, 4, 0, 0]} />
          <Bar dataKey="study" fill="#d9603d" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gym" fill="#6d7f2a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
