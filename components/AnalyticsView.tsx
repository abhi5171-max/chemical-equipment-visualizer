
import React from 'react';
import { SummaryStats, EquipmentItem } from '../types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Thermometer, Gauge, Wind, Hash } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement,
  Filler
);

interface Props {
  summary: SummaryStats;
  rows: EquipmentItem[];
}

const AnalyticsView: React.FC<Props> = ({ summary, rows }) => {
  const typeLabels = Object.keys(summary.distribution_by_type);
  const typeValues = Object.values(summary.distribution_by_type);

  const typeData = {
    labels: typeLabels,
    datasets: [
      {
        label: 'Equipment Type Distribution',
        data: typeValues,
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(16, 185, 129, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          'rgba(139, 92, 246, 0.6)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Dynamically map data from the actual rows
  const trendData = {
    labels: rows.map((r, i) => r.equipment_name || `Unit ${i + 1}`),
    datasets: [
      {
        fill: true,
        label: 'Flowrate (m³/h)',
        data: rows.map(r => r.flowrate),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
      {
        fill: true,
        label: 'Pressure (bar)',
        data: rows.map(r => r.pressure),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'rgb(16, 185, 129)',
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Equipment" 
          value={summary.total_equipment_count} 
          icon={<Hash className="text-blue-600" size={24} />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Avg Flowrate" 
          value={`${summary.average_flowrate.toFixed(1)} m³/h`} 
          icon={<Wind className="text-emerald-600" size={24} />} 
          color="bg-emerald-50"
        />
        <StatCard 
          title="Avg Pressure" 
          value={`${summary.average_pressure.toFixed(1)} bar`} 
          icon={<Gauge className="text-amber-600" size={24} />} 
          color="bg-amber-50"
        />
        <StatCard 
          title="Avg Temperature" 
          value={`${summary.average_temperature.toFixed(1)} °C`} 
          icon={<Thermometer className="text-rose-600" size={24} />} 
          color="bg-rose-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Type Distribution</h3>
          <div className="h-64 flex justify-center">
            <Doughnut 
              data={typeData} 
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} 
            />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Process Trends</h3>
          <div className="h-64">
            <Line 
              data={trendData} 
              options={{ 
                maintainAspectRatio: false, 
                plugins: { 
                  legend: { display: true },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  }
                },
                scales: { 
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.03)' } },
                  x: { grid: { display: false }, ticks: { display: false } }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
    <div className={`p-4 rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-2xl font-black text-gray-800">{value}</p>
    </div>
  </div>
);

export default AnalyticsView;
