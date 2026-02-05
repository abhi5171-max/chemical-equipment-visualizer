
import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { DatasetHistory, EquipmentItem, SummaryStats } from '../types';

interface Props {
  onUploadSuccess: (ds: DatasetHistory, rows: EquipmentItem[]) => void;
}

const FileUploader: React.FC<Props> = ({ onUploadSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a valid CSV file.');
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim() !== '');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const rows: EquipmentItem[] = lines.slice(1).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        return {
          id: index + Date.now(),
          equipment_name: values[0] || 'Unknown',
          type: values[1] || 'Unknown',
          flowrate: parseFloat(values[2]) || 0,
          pressure: parseFloat(values[3]) || 0,
          temperature: parseFloat(values[4]) || 0,
        };
      });

      // Calculate Real Analytics Summary
      const totalCount = rows.length;
      const avgFlow = rows.reduce((acc, curr) => acc + curr.flowrate, 0) / totalCount;
      const avgPress = rows.reduce((acc, curr) => acc + curr.pressure, 0) / totalCount;
      const avgTemp = rows.reduce((acc, curr) => acc + curr.temperature, 0) / totalCount;
      
      const typeDist: Record<string, number> = {};
      rows.forEach(r => {
        typeDist[r.type] = (typeDist[r.type] || 0) + 1;
      });

      const summary: SummaryStats = {
        total_equipment_count: totalCount,
        average_flowrate: avgFlow,
        average_pressure: avgPress,
        average_temperature: avgTemp,
        distribution_by_type: typeDist
      };

      const newDataset: DatasetHistory = {
        id: Date.now(),
        filename: file.name,
        timestamp: new Date().toISOString(),
        summary: summary
      };

      setTimeout(() => {
        onUploadSuccess(newDataset, rows);
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }, 800);
    };

    reader.readAsText(file);
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center space-x-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-lg shadow-blue-200 disabled:opacity-50"
      >
        <Upload size={16} />
        <span>{uploading ? 'Processing...' : 'Upload CSV'}</span>
      </button>
    </div>
  );
};

export default FileUploader;
