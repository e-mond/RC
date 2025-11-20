import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

export default function AnalyticsChart({
  title = "Analytics",
  type = "line",
  data = [],
  dataKey = "value",
  xKey = "label",
}) {
  const Chart =
    type === "line"
      ? LineChart
      : type === "bar"
      ? BarChart
      : type === "area"
      ? AreaChart
      : LineChart;

  const Plot =
    type === "line"
      ? <Line type="monotone" dataKey={dataKey} strokeWidth={2} />
      : type === "bar"
      ? <Bar dataKey={dataKey} />
      : type === "area"
      ? <Area dataKey={dataKey} strokeWidth={2} fillOpacity={0.3} />
      : <Line type="monotone" dataKey={dataKey} strokeWidth={2} />;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>

      <CardContent className="h-[260px]">
        {data?.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <Chart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} />
              <YAxis />
              <Tooltip />
              {Plot}
            </Chart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
