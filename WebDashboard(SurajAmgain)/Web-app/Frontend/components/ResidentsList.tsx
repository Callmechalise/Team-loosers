// components/ResidentsList.tsx
'use client';

import { useState } from 'react';
import { Resident } from '@/types';

interface ResidentsListProps {
  initialResidents: Resident[];
}

export function ResidentsList({ initialResidents }: ResidentsListProps) {
  const [residents] = useState<Resident[]>(initialResidents);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResidents = residents.filter((resident) =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.building.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      healthy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      emergency: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold dark:text-white">Residents ({residents.length})</h1>
        <input
          type="text"
          placeholder="Search residents..."
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.map((resident) => (
          <div key={resident.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <img
                src={resident.photo}
                alt={resident.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold dark:text-white truncate">{resident.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Age: {resident.age} · Room: {resident.room}
                </p>
                <span className={`text-xs px-2 py-1 rounded inline-block ${getStatusBadge(resident.status)}`}>
                  {resident.status}
                </span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t dark:border-gray-700">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">HR</span>
                  <p className="font-semibold dark:text-white">{resident.vitals?.heartRate || 'N/A'} BPM</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">SpO2</span>
                  <p className="font-semibold dark:text-white">{resident.vitals?.spo2 || 'N/A'}%</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Temp</span>
                  <p className="font-semibold dark:text-white">{resident.vitals?.temperature || 'N/A'}°C</p>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>📍 {resident.indoorLocation || 'Unknown'}</span>
                <span>👤 {resident.assignedCaretaker}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredResidents.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No residents found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}