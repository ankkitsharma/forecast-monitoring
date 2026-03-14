import { useState, useEffect, useMemo } from "react";
import { format, parseISO, subHours, isBefore, isEqual } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Sliders, Wind } from "lucide-react";
import { fetchActuals, fetchForecasts } from "./api";
import type { FuelHHData, WindForData } from "./api";

const JAN_2024_START = "2024-01-01";
const JAN_2024_END = "2024-01-31";

function App() {
  const [startTime, setStartTime] = useState(JAN_2024_START);
  const [endTime, setEndTime] = useState("2024-01-07");
  const [horizon, setHorizon] = useState(4);
  const [actuals, setActuals] = useState<FuelHHData[]>([]);
  const [forecasts, setForecasts] = useState<WindForData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [act, fore] = await Promise.all([
          fetchActuals(startTime, endTime),
          fetchForecasts(startTime, endTime),
        ]);
        setActuals(act);
        setForecasts(fore);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startTime, endTime]);

  type MergedItem = {
    time: string;
    actual: number;
    forecast: number | null;
  };

  const chartData = useMemo(() => {
    // Process data to merge actuals and latest forecasts based on horizon
    const merged: MergedItem[] = [];

    // Sort actuals by startTime
    const sortedActuals = [...actuals].sort(
      (a, b) =>
        parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime(),
    );

    sortedActuals.forEach((actual) => {
      const targetTime = parseISO(actual.startTime);
      const deadline = subHours(targetTime, horizon);

      // Find the latest forecast for this targetTime published before deadline
      const relevantForecasts = forecasts.filter((f) => {
        const fStartTime = parseISO(f.startTime);
        const fPublishTime = parseISO(f.publishTime);
        return (
          isEqual(fStartTime, targetTime) &&
          (isBefore(fPublishTime, deadline) || isEqual(fPublishTime, deadline))
        );
      });

      // Sort by publishTime descending to get the latest
      relevantForecasts.sort(
        (a, b) =>
          parseISO(b.publishTime).getTime() - parseISO(a.publishTime).getTime(),
      );

      const latestForecast = relevantForecasts[0];

      merged.push({
        time: format(targetTime, "dd/MM HH:mm"),
        actual: actual.generation,
        forecast: latestForecast?.generation || null,
      });
    });

    return merged;
  }, [actuals, forecasts, horizon]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center space-x-3 pb-4 border-b">
          <Wind className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-slate-800">
            Wind Forecast Monitor
          </h1>
        </header>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <Calendar className="w-4 h-4 mr-2" /> Start Date
            </label>
            <input
              type="date"
              min={JAN_2024_START}
              max={JAN_2024_END}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <Calendar className="w-4 h-4 mr-2" /> End Date
            </label>
            <input
              type="date"
              min={startTime}
              max={JAN_2024_END}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700 justify-between">
              <span className="flex items-center">
                <Sliders className="w-4 h-4 mr-2" /> Forecast Horizon
              </span>
              <span className="text-blue-600 font-bold">{horizon} hours</span>
            </label>
            <input
              type="range"
              min="0"
              max="48"
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* Status */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Chart */}
        {!loading && !error && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    minTickGap={30}
                    label={{
                      value: "Target Time End (UTC)",
                      position: "insideBottom",
                      offset: -15,
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    label={{
                      value: "Power (MW)",
                      angle: -90,
                      position: "insideLeft",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#2563eb"
                    name="Actual Generation"
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="#10b981"
                    name={`Forecast (${horizon}h horizon)`}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <footer className="text-center text-sm text-slate-500 pt-4">
          <p>UK National Wind Power Generation - January 2024</p>
          <p className="mt-1">Data source: Elexon Insights Solution (BMRS)</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
