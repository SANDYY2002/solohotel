"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BRONZE = "#c9a15c";
const CONSERVATORY = "#2f4030";
const STONE = "#a8a29e";
const PIE_COLORS = [BRONZE, CONSERVATORY, STONE, "#8b5e34", "#5c7a5e"];

type MonthlyPoint = { month: string; bookings: number; revenue: number };
type MessagesPoint = { month: string; count: number };
type StatusSlice = { name: string; value: number };
type RoomBar = { name: string; bookings: number };

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-sm border border-stone-200 p-5 dark:border-stone-800">
      <h2 className="font-display text-lg">{title}</h2>
      <div className="mt-4 h-64">{children}</div>
    </div>
  );
}

export function BookingsTrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ChartCard title="Bookings & revenue by month">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={BRONZE} stopOpacity={0.35} />
              <stop offset="95%" stopColor={BRONZE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
          <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
          <Tooltip
            formatter={(value, name) => (name === "revenue" ? [`$${Number(value).toLocaleString()}`, "Revenue"] : [value, "Bookings"])}
            contentStyle={{ fontSize: 12, borderRadius: 4 }}
          />
          <Area type="monotone" dataKey="bookings" stroke={BRONZE} fill="url(#bookingsFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function RevenueTrendChart({ data }: { data: MonthlyPoint[] }) {
  return (
    <ChartCard title="Revenue by month">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CONSERVATORY} stopOpacity={0.4} />
              <stop offset="95%" stopColor={CONSERVATORY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} stroke="currentColor" opacity={0.5} />
          <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]} contentStyle={{ fontSize: 12, borderRadius: 4 }} />
          <Area type="monotone" dataKey="revenue" stroke={CONSERVATORY} fill="url(#revenueFill)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function StatusPieChart({ data, title }: { data: StatusSlice[]; title: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <ChartCard title={title}>
      {total === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-stone-400">No data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function TopRoomsChart({ data }: { data: RoomBar[] }) {
  return (
    <ChartCard title="Most booked rooms">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-stone-400">No data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} stroke="currentColor" opacity={0.5} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
            <Bar dataKey="bookings" fill={BRONZE} radius={[0, 3, 3, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}

export function MessagesTrendChart({ data }: { data: MessagesPoint[] }) {
  return (
    <ChartCard title="Contact messages by month">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} />
          <YAxis tick={{ fontSize: 11 }} stroke="currentColor" opacity={0.5} allowDecimals={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} />
          <Bar dataKey="count" fill={CONSERVATORY} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
