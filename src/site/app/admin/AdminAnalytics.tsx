"use client";

import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { TrendingUp, DollarSign, Users, Heart, Download } from "lucide-react";
import { useSiteStore } from "@/site/lib/siteStore";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const MONTHLY_DATA = [
  { month: "Jan", amount: 3200, donors: 8 },
  { month: "Feb", amount: 4800, donors: 12 },
  { month: "Mar", amount: 3900, donors: 9 },
  { month: "Apr", amount: 6200, donors: 15 },
  { month: "May", amount: 8750, donors: 18 },
  { month: "Jun", amount: 9500, donors: 22 },
];

const COLORS = ["#6E9277", "#EAC79A", "#5A4749", "#474747", "#9bc4a8", "#d4b07a", "#a07090", "#70a0b0"];

const PIE_TOOLTIP_STYLE = {
  backgroundColor: "#ffffff",
  border: "1px solid #e3d9ce",
  borderRadius: 8,
  fontSize: 12,
};

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <motion.div whileHover={{ y: -4 }} className="bg-white rounded-2xl border border-[#e3d9ce] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "18" }}>
          <Icon size={18} style={{ color }} />
        </div>
        <TrendingUp size={14} className="text-[#6E9277]" />
      </div>
      <p className="text-2xl mb-0.5" style={{ fontFamily: "'Francois One', sans-serif", color }}>{value}</p>
      <p className="text-sm font-medium text-[#474747]">{label}</p>
      <p className="text-xs text-[#7a7068] mt-0.5">{sub}</p>
    </motion.div>
  );
}

export default function AdminAnalytics() {
  const { donations } = useSiteStore();

  const validDonations = donations.filter(d => d.status !== "rejected");
  const totalRaised = validDonations.reduce((s, d) => s + d.amount, 0);
  const monthlyRecurring = donations.filter(d => d.frequency === "monthly" && d.status !== "rejected").reduce((s, d) => s + d.amount, 0);
  const uniqueDonors = new Set(donations.map(d => d.email)).size;
  const avgGift = validDonations.length > 0 ? Math.round(totalRaised / validDonations.length) : 0;

  // Method breakdown
  const methodBreakdown = Object.entries(
    validDonations.reduce<Record<string, number>>((acc, d) => {
      acc[d.method] = (acc[d.method] || 0) + d.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({
    name: name === "card" ? "Credit Card" : name === "paypal" ? "PayPal" : name === "bank" ? "Bank Transfer" : name === "check" ? "Check" : name === "daf" ? "DAF" : name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    value,
  }));

  // Frequency breakdown
  const oneTimeTotal = validDonations.filter(d => d.frequency === "one-time").reduce((s, d) => s + d.amount, 0);
  const freqData = [
    { name: "One-Time", value: oneTimeTotal },
    { name: "Monthly", value: monthlyRecurring },
  ];

  // Status breakdown
  const statusBreakdown = (["completed", "approved", "pending", "rejected"] as const).map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: donations.filter(d => d.status === s).length,
    amount: donations.filter(d => d.status === s).reduce((sum, d) => sum + d.amount, 0),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl text-[#474747]">Finance Analytics</h1>
          <p className="text-sm text-[#7a7068]">Overview of all donation activity</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#e3d9ce] text-[#474747] hover:bg-[#EFE7DB]">
          <Download size={15} /> Export CSV
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={DollarSign} label="Total Raised" value={`$${totalRaised.toLocaleString()}`} sub="Approved + completed" color="#6E9277" />
        <StatCard icon={Heart} label="Monthly Recurring" value={`$${monthlyRecurring.toLocaleString()}/mo`} sub="Active monthly donors" color="#5A4749" />
        <StatCard icon={Users} label="Unique Donors" value={uniqueDonors} sub="All time" color="#EAC79A" />
        <StatCard icon={TrendingUp} label="Avg. Gift" value={`$${avgGift.toLocaleString()}`} sub="Per donation" color="#474747" />
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly trend */}
        <div className="bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-5">Monthly Donation Trend (2025)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MONTHLY_DATA} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe4" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#7a7068" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#7a7068" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={PIE_TOOLTIP_STYLE} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Raised"]} />
              <Bar dataKey="amount" fill="#6E9277" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donation by method */}
        <div className="bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-5">Donations by Payment Method</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie data={methodBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {methodBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={PIE_TOOLTIP_STYLE} formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {methodBreakdown.map((item, i) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-[#474747]">{item.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#474747]">${item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* One-time vs monthly */}
        <div className="bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-5">One-Time vs Monthly</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={freqData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={4}>
                <Cell fill="#6E9277" />
                <Cell fill="#EAC79A" />
              </Pie>
              <Tooltip contentStyle={PIE_TOOLTIP_STYLE} formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {freqData.map((f, i) => (
              <div key={f.name} className="flex items-center gap-1.5 text-xs text-[#474747]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i === 0 ? "#6E9277" : "#EAC79A" }} />
                {f.name}
              </div>
            ))}
          </div>
        </div>

        {/* Status breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e3d9ce] p-6">
          <h3 className="text-sm font-semibold text-[#474747] mb-5">Donation Status Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            {statusBreakdown.map((s) => {
              const colors: Record<string, { bg: string; text: string }> = {
                Completed: { bg: "#6E9277" + "15", text: "#6E9277" },
                Approved: { bg: "#5a7d64" + "15", text: "#5a7d64" },
                Pending: { bg: "#d97706" + "15", text: "#d97706" },
                Rejected: { bg: "#dc2626" + "15", text: "#dc2626" },
              };
              const c = colors[s.name] || { bg: "#e3d9ce", text: "#474747" };
              return (
                <div key={s.name} className="rounded-xl p-4" style={{ backgroundColor: c.bg }}>
                  <p className="text-xs font-semibold mb-1" style={{ color: c.text }}>{s.name}</p>
                  <p className="text-xl font-bold" style={{ color: c.text, fontFamily: "'Francois One', sans-serif" }}>{s.count}</p>
                  <p className="text-xs" style={{ color: c.text }}>${s.amount.toLocaleString()} total</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top donors */}
      <div className="bg-white rounded-2xl border border-[#e3d9ce] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e3d9ce]">
          <h3 className="text-sm font-semibold text-[#474747]">Top Donors</h3>
        </div>
        {[...validDonations].sort((a, b) => b.amount - a.amount).slice(0, 6).map((d, i) => (
          <div key={d.id} className="flex items-center gap-4 px-6 py-3.5 border-b border-[#f5f0ea] last:border-0 hover:bg-[#faf8f5]">
            <span className="text-sm font-bold text-[#a09890] w-5">{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#474747]">{d.name}</p>
              <p className="text-xs text-[#7a7068]">{d.email} · {d.date}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{ color: "#6E9277" }}>${d.amount.toLocaleString()}</p>
              <p className="text-xs text-[#7a7068] capitalize">{d.frequency} · {d.method}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
