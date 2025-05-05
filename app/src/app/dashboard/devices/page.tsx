"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DbDevice } from "@/types";
import { getDevices } from "@/lib/data";
import { FaMobile, FaSyncAlt, FaPlus, FaSearch } from "react-icons/fa";

export default function DevicesPage() {
  const [devices, setDevices] = useState<DbDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadDevices() {
      try {
        const data = await getDevices();
        setDevices(data);
      } catch (error) {
        console.error("Error loading devices:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, []);

  // Filter devices based on search term
  const filteredDevices = devices.filter(
    (device) =>
      device.device_id.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.model_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device.phone_number && device.phone_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Devices</h1>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <FaSyncAlt />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <FaPlus />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search devices..."
            className="bg-transparent border-none text-white placeholder-gray-400 focus:outline-none w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredDevices.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FaMobile className="text-4xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No Devices Found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm
              ? "No devices match your search criteria."
              : "There are no devices in the system yet."}
          </p>
          <button className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <FaPlus className="mr-2" />
            <span>Add your first device</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => (
            <Link 
              href={`/dashboard/devices/${device.device_id}`}
              key={device.device_id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border border-gray-700 hover:border-gray-600"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">
                    {device.device_id}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    device.status === 'active' ? 'bg-green-100 text-green-800' :
                    device.status === 'retired' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {device.status}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-center">
                    <span className="w-24 text-gray-400">Model:</span>
                    <span>{device.model_type || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-24 text-gray-400">Phone:</span>
                    <span>{device.phone_number || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-24 text-gray-400">Carrier:</span>
                    <span>{device.mobile_carrier || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="w-24 text-gray-400">Serial:</span>
                    <span className="truncate">{device.serial_number || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-700 flex items-center text-xs text-gray-400">
                  <FaMobile className="mr-1" />
                  <span>Agent ID: {device.agent_id}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 