'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { 
  Users, CheckCircle2, TrendingUp, Wallet, AlertCircle 
} from 'lucide-react';
import { dashboardApi } from '@/lib/apiClient';
import { getCurrentMonthYear, formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MonthYearSelector } from '@/components/ui/MonthYearSelector';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function DashboardPage() {
  const [period, setPeriod] = useState(getCurrentMonthYear());
  
  const { data: stats, isLoading } = useSWR(
    ['dashboard', period.month, period.year], 
    () => dashboardApi.get(period.month, period.year).then(res => res.data!)
  );

  if (isLoading || !stats) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  const pieData = [
    { name: 'Paid', value: stats.paidTenants, color: '#22c55e' },
    { name: 'Partial', value: stats.partialTenants, color: '#f59e0b' },
    { name: 'Unpaid', value: stats.unpaidTenants, color: '#ef4444' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Overview</h1>
        <MonthYearSelector 
          month={period.month} year={period.year} 
          onChange={(m, y) => setPeriod({ month: m, year: y })} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Tenants" 
          value={stats.totalTenants.toString()} 
          icon={<Users className="h-5 w-5 text-blue-500" />} 
          trend="Active this month" 
        />
        <KpiCard 
          title="Total Bill" 
          value={formatCurrency(stats.totalBillAmount)} 
          icon={<Wallet className="h-5 w-5 text-indigo-500" />} 
          trend="Generated for period" 
        />
        <KpiCard 
          title="Collected" 
          value={formatCurrency(stats.totalCollected)} 
          icon={<TrendingUp className="h-5 w-5 text-green-500" />} 
          trend={`Due: ${formatCurrency(stats.totalDue)}`} 
          trendColor="text-red-500"
        />
        <KpiCard 
          title="Payment Status" 
          value={`${stats.paidTenants} / ${stats.totalTenants} Paid`} 
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} 
          trend={`${stats.unpaidTenants} still unpaid`} 
          trendColor="text-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts & Analytics */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <h3 className="font-semibold text-lg mb-6">Payment Distribution</h3>
            {pieData.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="h-[250px] flex items-center justify-center text-sm text-slate-400 border-2 border-dashed rounded-lg">
                 No payment data generated
               </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Summary List */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-lg">Tenant Summaries</h3>
            </div>
            <div className="divide-y max-h-[400px] overflow-y-auto">
              {stats.tenantSummaries.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">No tenants found</div>
              )}
              {stats.tenantSummaries.map(({ tenant, payment, status }: any) => (
                <div key={tenant._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <h4 className="font-medium text-slate-900">{tenant.name}</h4>
                    <p className="text-xs text-slate-500">Room {tenant.room?.roomNumber}</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div className="text-sm">
                      {payment ? formatCurrency(payment.due) : 'N/A'} due
                    </div>
                    <div>
                      {status === 'paid' && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">Paid</span>}
                      {status === 'partial' && <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Partial</span>}
                      {status === 'unpaid' && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">Unpaid</span>}
                      {status === 'no-bill' && <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">No Bill</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function KpiCard({ title, value, icon, trend, trendColor = 'text-slate-500' }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            {icon}
          </div>
        </div>
        <p className={`text-xs mt-4 ${trendColor}`}>{trend}</p>
      </CardContent>
    </Card>
  );
}
