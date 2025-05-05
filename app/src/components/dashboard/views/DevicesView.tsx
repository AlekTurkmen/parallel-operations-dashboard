"use client";

import { useEffect, useState } from "react";
import { DbDevice } from "@/types";
import { getDevices } from "@/lib/data";
import { FaMobile, FaSyncAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaExternalLinkAlt } from "react-icons/fa";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";

export default function DevicesView() {
  const [devices, setDevices] = useState<DbDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<DbDevice | null>(null);
  const [formData, setFormData] = useState<Partial<DbDevice>>({
    "device_id": "",
    "agent_id": 0,
    "model_type": "",
    "serial_number": "",
    "phone_number": "",
    "mobile_carrier": "",
    imei: "",
    "airdroid_id": "",
    status: "active"
  });

  // Device model types and image mapping
  const deviceModels = [
    { value: "S22", label: "Samsung Galaxy S22" },
    { value: "PIXEL 6A", label: "Google Pixel 6A" },
    { value: "MOTO G", label: "Motorola Moto G" },
    { value: "IPHONE 15", label: "iPhone 15" },
    { value: "A52", label: "Samsung Galaxy A52" },
    { value: "A23", label: "Samsung Galaxy A23" },
    { value: "A16", label: "Samsung Galaxy A16" },
    { value: "A15", label: "Samsung Galaxy A15" },
    { value: "A14", label: "Samsung Galaxy A14" },
    { value: "S8", label: "Samsung Galaxy S8" },
  ];

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    try {
      setLoading(true);
      const data = await getDevices();
      
      // Sort devices numerically first, then put iphone and shop devices at the end
      const sortedDevices = [...data].sort((a, b) => {
        // Extract numeric parts if they exist
        const aIdLower = a["device_id"].toLowerCase();
        const bIdLower = b["device_id"].toLowerCase();
        
        // Check if it's an iphone or shop device
        const aIsSpecial = aIdLower.includes('iphone-') || aIdLower.includes('shop-');
        const bIsSpecial = bIdLower.includes('iphone-') || bIdLower.includes('shop-');
        
        // If one is special and the other isn't, put the special one at the end
        if (aIsSpecial && !bIsSpecial) return 1;
        if (!aIsSpecial && bIsSpecial) return -1;
        
        // If both are special or both are not special, sort numerically
        const aNum = parseInt(a["device_id"].replace(/\D/g, '')) || 0;
        const bNum = parseInt(b["device_id"].replace(/\D/g, '')) || 0;
        return aNum - bNum;
      });
      
      setDevices(sortedDevices);
    } catch (error) {
      console.error("Error loading devices:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }

  // Function to get device image based on model type
  const getDeviceImage = (modelType: string): string => {
    // Normalize model type for comparison
    const normalizedModel = modelType?.toUpperCase().trim() || "";
    
    // Find exact match first
    const exactMatch = deviceModels.find(model => 
      model.value.toUpperCase() === normalizedModel
    );
    
    if (exactMatch) {
      return `/devices/${exactMatch.value}.png`;
    }
    
    // If no exact match, check for partial matches
    for (const model of deviceModels) {
      if (normalizedModel.includes(model.value.toUpperCase()) || 
          model.value.toUpperCase().includes(normalizedModel)) {
        return `/devices/${model.value}.png`;
      }
    }
    
    // Default image if no match found
    return "/devices/unassigned.png";
  };

  // Filter devices based on search term
  const filteredDevices = devices.filter(
    (device) =>
      device["device_id"].toLowerCase().includes(searchTerm.toLowerCase()) ||
      device["model_type"].toLowerCase().includes(searchTerm.toLowerCase()) ||
      (device["serial_number"] && device["serial_number"].toLowerCase().includes(searchTerm.toLowerCase())) ||
      (device.imei && device.imei.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (device["mobile_carrier"] && device["mobile_carrier"].toLowerCase().includes(searchTerm.toLowerCase())) ||
      (device["phone_number"] && device["phone_number"].includes(searchTerm))
  );

  // Get the carrier style based on the carrier name
  const getCarrierStyle = (carrier: string) => {
    if (!carrier) return "";
    const lowerCarrier = carrier.toLowerCase();
    if (lowerCarrier.includes('t-mobile')) {
      return 'text-pink-500 font-medium';
    } else if (lowerCarrier.includes('verizon')) {
      return 'text-red-600 font-medium';
    } else if (lowerCarrier.includes('at&t') || lowerCarrier.includes('at&t')) {
      return 'text-blue-500 font-medium';
    }
    return '';
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "agent_id" ? parseInt(value) || 0 : value
    });
  };

  // Edit a device
  const handleEdit = (device: DbDevice) => {
    setCurrentDevice(device);
    setFormData(device);
    setIsEditing(true);
    setIsAdding(false);
  };

  // Add a new device
  const handleAdd = () => {
    setCurrentDevice(null);
    setFormData({
      "device_id": "",
      "agent_id": 0,
      "model_type": "",
      "serial_number": "",
      "phone_number": "",
      "mobile_carrier": "",
      imei: "",
      "airdroid_id": "",
      status: "active"
    });
    setIsAdding(true);
    setIsEditing(false);
  };

  // Delete a device
  const handleDelete = (deviceId: string) => {
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete this device? This action cannot be undone.")) {
      console.log(`Delete device with ID: ${deviceId}`);
      setDevices(devices.filter(d => d["device_id"] !== deviceId));
    }
  };

  // Save changes (update or create)
  const handleSave = () => {
    // Validation
    if (!formData["device_id"]) {
      alert("Device ID is required");
      return;
    }

    if (isEditing) {
      // Update existing device
      const updatedDevices = devices.map(device => 
        device["device_id"] === currentDevice?.["device_id"] ? { ...device, ...formData } : device
      );
      setDevices(updatedDevices);
    } else if (isAdding) {
      // Check if device ID already exists
      if (devices.some(d => d["device_id"] === formData["device_id"])) {
        alert("A device with this ID already exists");
        return;
      }
      // Add new device with current timestamp
      setDevices([...devices, { ...formData, "last_updated": new Date().toISOString() } as DbDevice]);
    }
    
    // Reset form state
    setIsEditing(false);
    setIsAdding(false);
    setCurrentDevice(null);
    setFormData({
      "device_id": "",
      "agent_id": 0,
      "model_type": "",
      "serial_number": "",
      "phone_number": "",
      "mobile_carrier": "",
      imei: "",
      "airdroid_id": "",
      status: "active"
    });
  };

  // Cancel editing/adding
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentDevice(null);
    setFormData({
      "device_id": "",
      "agent_id": 0,
      "model_type": "",
      "serial_number": "",
      "phone_number": "",
      "mobile_carrier": "",
      imei: "",
      "airdroid_id": "",
      status: "active"
    });
  };

  // Function to handle status change with auto-save to Supabase
  const handleStatusChange = async (deviceId: string, newStatus: string) => {
    try {
      // Update local state first for immediate UI feedback
      const updatedDevices = devices.map(device => 
        device["device_id"] === deviceId 
          ? { ...device, status: newStatus, "last_updated": new Date().toISOString() } 
          : device
      );
      setDevices(updatedDevices);
      
      // Update the database
      const device = devices.find(d => d["device_id"] === deviceId);
      if (device) {
        const { data, error } = await supabase
          .from('devices')
          .update({ status: newStatus, "last_updated": new Date().toISOString() })
          .eq('device_id', deviceId);
          
        if (error) {
          console.error('Error updating device status:', error);
          // Revert on error
          loadDevices();
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      loadDevices();
    }
  };

  // Update the status options with clear color codes
  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
    { value: "inactive", label: "Inactive", color: "bg-yellow-100 text-yellow-800" },
    { value: "repair", label: "Repair", color: "bg-red-100 text-red-800" },
    { value: "retired", label: "Retired", color: "bg-gray-100 text-gray-800" }
  ];

  // Get status style based on status
  const getStatusStyle = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status?.toLowerCase());
    return statusOption?.color || "bg-gray-100 text-gray-800";
  };

  // Update the AirDroid ID in the database when it's changed
  const handleAirDroidChange = async (deviceId: string, newAirDroidId: string) => {
    if (!deviceId) return; // Skip if no deviceId is provided
    
    try {
      // Update local state first for immediate UI feedback
      const updatedDevices = devices.map(device => 
        device["device_id"] === deviceId 
          ? { ...device, "airdroid_id": newAirDroidId, "last_updated": new Date().toISOString() } 
          : device
      );
      setDevices(updatedDevices);
      
      // Update the database
      const { data, error } = await supabase
        .from('devices')
        .update({ "airdroid_id": newAirDroidId, "last_updated": new Date().toISOString() })
        .eq('device_id', deviceId);
        
      if (error) {
        console.error('Error updating AirDroid ID:', error);
        // Revert on error
        loadDevices();
      }
    } catch (error) {
      console.error('Error updating AirDroid ID:', error);
      // Revert on error
      loadDevices();
    }
  };

  // Update the airdroid_id change in the form
  const handleFormAirDroidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      "airdroid_id": e.target.value
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Devices Management</h2>
        <div className="flex space-x-3">
          <button 
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={loadDevices}
          >
            <FaSyncAlt />
            <span>Refresh</span>
          </button>
          <button 
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={handleAdd}
          >
            <FaPlus />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Search */}
      {!isEditing && !isAdding && (
        <div className="mb-6">
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
      )}

      {/* Edit/Add Form */}
      {(isEditing || isAdding) && (
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? "Edit Device" : "Add New Device"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Device ID*
              </label>
              <input
                type="text"
                name="device_id"
                value={formData["device_id"]}
                onChange={handleInputChange}
                disabled={isEditing} // Can't change ID when editing
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Agent ID
              </label>
              <input
                type="number"
                name="agent_id"
                value={formData["agent_id"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Model Type
              </label>
              <select
                name="model_type"
                value={formData["model_type"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Model</option>
                {deviceModels.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Serial Number
              </label>
              <input
                type="text"
                name="serial_number"
                value={formData["serial_number"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData["phone_number"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Mobile Carrier
              </label>
              <select
                name="mobile_carrier"
                value={formData["mobile_carrier"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Carrier</option>
                <option value="T-Mobile">T-Mobile</option>
                <option value="Verizon">Verizon</option>
                <option value="AT&T">AT&T</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                IMEI
              </label>
              <input
                type="text"
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                AirDroid ID
              </label>
              <input
                type="text"
                name="airdroid_id"
                value={formData["airdroid_id"]}
                onChange={handleFormAirDroidChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Devices Table */}
      {!isEditing && !isAdding && !error && (
        loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="text-center py-8">
            <FaMobile className="text-4xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Devices Found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm
                ? "No devices match your search criteria."
                : "There are no devices in the system yet."}
            </p>
            {!searchTerm && (
              <button 
                onClick={handleAdd}
                className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaPlus className="mr-2" />
                <span>Add your first device</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Device
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Model
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Carrier
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Agent
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredDevices.map((device) => (
                  <tr key={device["device_id"]} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 mr-3">
                          <Image
                            src={getDeviceImage(device["model_type"] || "")}
                            alt={device["model_type"] || "Device"}
                            width={40}
                            height={40}
                            className="rounded-sm"
                          />
                        </div>
                        <div>
                          <div>{device["device_id"]}</div>
                          <div className="flex items-center mt-1">
                            <input
                              type="text"
                              value={device["airdroid_id"] || ""}
                              onChange={(e) => handleAirDroidChange(device["device_id"], e.target.value)}
                              placeholder="AirDroid ID"
                              className="text-xs px-1 py-0.5 w-24 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-300 mr-1"
                            />
                            {device["airdroid_id"] && (
                              <a 
                                href={`https://biz.airdroid.com/#/devices/list/-100/${device["airdroid_id"]}`}
                                target="_blank"
                                rel="noopener noreferrer" 
                                className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                              >
                                <FaExternalLinkAlt className="mr-1 text-xs" /> AirDroid
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {device["model_type"] || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {device["phone_number"] || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className={`${getCarrierStyle(device["mobile_carrier"] || "")}`}>
                        {device["mobile_carrier"] || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <select
                        value={device.status || "active"}
                        onChange={(e) => handleStatusChange(device["device_id"], e.target.value)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${getStatusStyle(device.status || "active")}`}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-6 w-6 mr-2">
                          <Image
                            src="/mac.png"
                            alt="Agent"
                            width={24}
                            height={24}
                            className="rounded-sm"
                          />
                        </div>
                        <span>{device["agent_id"] || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(device)}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button 
                        onClick={() => handleDelete(device["device_id"])}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
} 