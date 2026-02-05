
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../services/AuthContext';
import HistorySidebar from './HistorySidebar';
import AnalyticsView from './AnalyticsView';
import DataTable from './DataTable';
import FileUploader from './FileUploader';
import { DatasetHistory, EquipmentItem, SummaryStats } from '../types';
import { LogOut, LayoutDashboard, Database, BarChart3, FileText, Download, Loader2, CheckCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [history, setHistory] = useState<DatasetHistory[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<number | null>(null);
  const [rows, setRows] = useState<EquipmentItem[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'table'>('analytics');
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('user_history_logs');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      setHistory(parsed);
      if (parsed.length > 0) {
        const latest = parsed[0];
        setSelectedDatasetId(latest.id);
        setSummary(latest.summary);
        const savedRows = localStorage.getItem(`rows_${latest.id}`);
        if (savedRows) setRows(JSON.parse(savedRows));
      }
    }
  }, []);

  const handleUploadSuccess = (newDataset: DatasetHistory, newRows: EquipmentItem[]) => {
    const updatedHistory = [newDataset, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem('user_history_logs', JSON.stringify(updatedHistory));
    localStorage.setItem(`rows_${newDataset.id}`, JSON.stringify(newRows));
    
    setSelectedDatasetId(newDataset.id);
    setSummary(newDataset.summary);
    setRows(newRows);
  };

  const selectDataset = (id: number) => {
    const ds = history.find(h => h.id === id);
    if (ds) {
      setSelectedDatasetId(id);
      setSummary(ds.summary);
      const savedRows = localStorage.getItem(`rows_${id}`);
      if (savedRows) setRows(JSON.parse(savedRows));
    }
  };

  const handleDownloadPDF = async () => {
    if (!selectedDatasetId || !summary || rows.length === 0) return;
    
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const doc = new jsPDF();
      const dataset = history.find(h => h.id === selectedDatasetId);
      const filename = dataset?.filename || 'Untitled_Dataset';

      // --- 1. BRANDED HEADER (UI Matching) ---
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('CHEM-VIS ANALYSIS REPORT', 14, 22);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`SESSION ID: #${selectedDatasetId} | FILENAME: ${filename.toUpperCase()}`, 14, 30);
      doc.text(`OPERATOR: ${user?.username?.toUpperCase() || 'GUEST'}`, 196, 22, { align: 'right' });

      // --- 2. STAT CARDS (Exact match to StatCard components) ---
      const statsY = 50;
      const cardW = 44;
      const cardH = 22;
      const cardGutter = 4.5;
      
      const statItems = [
        { label: 'TOTAL UNITS', value: `${summary.total_equipment_count}`, color: [59, 130, 246] },
        { label: 'AVG FLOWRATE', value: `${summary.average_flowrate.toFixed(1)} m3/h`, color: [16, 185, 129] },
        { label: 'AVG PRESSURE', value: `${summary.average_pressure.toFixed(1)} bar`, color: [245, 158, 11] },
        { label: 'AVG TEMP', value: `${summary.average_temperature.toFixed(1)} C`, color: [239, 68, 68] }
      ];

      statItems.forEach((stat, i) => {
        const x = 14 + i * (cardW + cardGutter);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(x, statsY, cardW, cardH, 3, 3, 'F');
        doc.setDrawColor(241, 245, 249);
        doc.roundedRect(x, statsY, cardW, cardH, 3, 3, 'S');
        
        doc.setFontSize(6.5);
        doc.setTextColor(156, 163, 175);
        doc.setFont('helvetica', 'bold');
        doc.text(stat.label, x + 4, statsY + 7);
        
        doc.setFontSize(10);
        doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
        doc.text(stat.value, x + 4, statsY + 16);
      });

      // --- 3. TYPE DISTRIBUTION (UI Matching Bar Chart) ---
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Type Distribution', 14, 88);

      const types = Object.keys(summary.distribution_by_type);
      const counts = Object.values(summary.distribution_by_type) as number[];
      const maxCount = Math.max(...counts);
      let distY = 98;
      
      types.forEach((type, i) => {
        const count = counts[i];
        const barMaxW = 100;
        const currentBarW = (count / maxCount) * barMaxW;
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(107, 114, 128);
        doc.text(type, 14, distY + 4);
        
        // Bar Background
        doc.setFillColor(243, 244, 246);
        doc.rect(50, distY, barMaxW, 5, 'F');
        // Actual Bar
        doc.setFillColor(59, 130, 246);
        doc.rect(50, distY, currentBarW, 5, 'F');
        
        doc.setTextColor(59, 130, 246);
        doc.setFont('helvetica', 'bold');
        doc.text(`${count}`, 50 + currentBarW + 3, distY + 4);
        distY += 8;
      });

      // --- 4. PROCESS TRENDS (Exact Logic match to AnalyticsView.tsx) ---
      doc.setTextColor(31, 41, 55);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Process Trends', 14, 160);

      const chartX = 20;
      const chartY = 175;
      const chartW = 175;
      const chartH = 45;

      // Axis
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.2);
      doc.line(chartX, chartY, chartX, chartY + chartH); // Y
      doc.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH); // X

      const flowData = rows.map(r => r.flowrate);
      const pressData = rows.map(r => r.pressure);
      const maxFlow = Math.max(...flowData, 1);
      const maxPress = Math.max(...pressData, 1);

      const plotLine = (data: number[], maxVal: number, color: number[]) => {
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(1);
        const step = chartW / (data.length - 1 || 1);
        for (let i = 0; i < data.length - 1; i++) {
          const x1 = chartX + i * step;
          const y1 = (chartY + chartH) - (data[i] / maxVal) * chartH;
          const x2 = chartX + (i + 1) * step;
          const y2 = (chartY + chartH) - (data[i + 1] / maxVal) * chartH;
          doc.line(x1, y1, x2, y2);
          doc.setFillColor(color[0], color[1], color[2]);
          doc.circle(x1, y1, 0.6, 'F');
        }
        // Last point circle
        const lastX = chartX + (data.length - 1) * step;
        const lastY = (chartY + chartH) - (data[data.length - 1] / maxVal) * chartH;
        doc.circle(lastX, lastY, 0.6, 'F');
      };

      plotLine(flowData, maxFlow, [59, 130, 246]); // Flow Blue
      plotLine(pressData, maxPress, [16, 185, 129]); // Pressure Green

      // Chart Legend
      doc.setFontSize(7);
      doc.setFillColor(59, 130, 246); doc.rect(140, 160, 3, 3, 'F');
      doc.setTextColor(107, 114, 128); doc.text('Flowrate (m3/h)', 145, 163);
      doc.setFillColor(16, 185, 129); doc.rect(168, 160, 3, 3, 'F');
      doc.text('Pressure (bar)', 173, 163);

      // --- 5. DATA TABLE PAGE ---
      doc.addPage();
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DETAILED EQUIPMENT LOG', 14, 10);

      (doc as any).autoTable({
        startY: 20,
        head: [['Equipment Name', 'Type', 'Flowrate (m³/h)', 'Pressure (bar)', 'Temp (°C)']],
        body: rows.map(r => [r.equipment_name, r.type, r.flowrate, r.pressure, r.temperature]),
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246], fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 2.5 },
        margin: { left: 14, right: 14 }
      });

      // Footer pagination
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text(`Page ${i} of ${pageCount}`, 105, 288, { align: 'center' });
      }

      doc.save(`CHEMVIS_Report_${selectedDatasetId}.pdf`);
      triggerSuccessToast();
      
    } catch (error) {
      console.error('PDF Export Error:', error);
      alert("Failed to export report. Check console.");
    } finally {
      setIsDownloading(false);
    }
  };

  const triggerSuccessToast = () => {
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden relative">
      <HistorySidebar 
        history={history} 
        selectedId={selectedDatasetId} 
        onSelect={selectDataset} 
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="text-blue-600" size={20} />
            <h2 className="font-semibold text-gray-800">
              Visualizer Dashboard 
              {selectedDatasetId && (
                <span className="ml-2 font-normal text-gray-400">
                  / {history.find(h => h.id === selectedDatasetId)?.filename}
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-800 leading-none">{user?.username || 'Guest'}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">Authorized Operator</p>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="bg-white px-6 py-3 flex items-center justify-between border-b border-gray-100 shrink-0">
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
            <button 
              onClick={() => setActiveTab('table')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Database size={16} />
              <span>Equipment Table</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="group flex items-center space-x-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition text-sm font-medium shadow-md disabled:opacity-50"
              onClick={handleDownloadPDF}
              disabled={!selectedDatasetId || isDownloading}
            >
              {isDownloading ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />}
              <span>{isDownloading ? 'Building Report...' : 'Download PDF Report'}</span>
            </button>
            <FileUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {!selectedDatasetId ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-8 bg-blue-50 text-blue-200 rounded-full mb-6 border-4 border-white shadow-inner">
                <FileText size={80} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2 uppercase tracking-tight">No Active Session</h3>
              <p className="text-gray-500 max-w-sm text-sm">Upload a CSV to generate real-time analytics and exported PDF reports.</p>
            </div>
          ) : (
            <>
              {activeTab === 'analytics' && summary && <AnalyticsView summary={summary} rows={rows} />}
              {activeTab === 'table' && <DataTable rows={rows} />}
            </>
          )}
        </main>
      </div>

      {showSuccessToast && (
        <div className="absolute bottom-8 right-8 bg-white border-l-4 border-green-500 text-gray-800 px-6 py-4 rounded-xl shadow-2xl flex items-center space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-green-100 p-2 rounded-full text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="font-black text-sm uppercase tracking-tight">Export Success</p>
            <p className="text-xs text-gray-500 font-medium">Detailed report saved to local drive.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
