
import React, { useState } from 'react';
import { EquipmentItem } from '../types';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  rows: EquipmentItem[];
}

const DataTable: React.FC<Props> = ({ rows }) => {
  const [sortField, setSortField] = useState<keyof EquipmentItem>('equipment_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof EquipmentItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }: { field: keyof EquipmentItem }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <Th label="Equipment Name" field="equipment_name" onSort={handleSort} sortIcon={<SortIcon field="equipment_name" />} />
              <Th label="Type" field="type" onSort={handleSort} sortIcon={<SortIcon field="type" />} />
              <Th label="Flowrate (m³/h)" field="flowrate" onSort={handleSort} sortIcon={<SortIcon field="flowrate" />} />
              <Th label="Pressure (bar)" field="pressure" onSort={handleSort} sortIcon={<SortIcon field="pressure" />} />
              <Th label="Temperature (°C)" field="temperature" onSort={handleSort} sortIcon={<SortIcon field="temperature" />} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedRows.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50/30 transition">
                <td className="px-6 py-4 text-sm font-medium text-gray-800">{row.equipment_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                    {row.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.flowrate}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.pressure}</td>
                <td className="px-6 py-4 text-sm text-gray-600 font-mono">{row.temperature}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Th: React.FC<{ label: string; field: keyof EquipmentItem; onSort: (f: keyof EquipmentItem) => void; sortIcon: React.ReactNode }> = ({ label, field, onSort, sortIcon }) => (
  <th 
    onClick={() => onSort(field)}
    className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition select-none"
  >
    <div className="flex items-center space-x-1">
      <span>{label}</span>
      <span className="text-blue-600">{sortIcon}</span>
    </div>
  </th>
);

export default DataTable;
