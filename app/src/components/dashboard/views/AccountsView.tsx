"use client";

import { useEffect, useState } from "react";
import { Account, Client } from "@/types";
import { getAccounts, getClients, getDevices } from "@/lib/data";
import { FaUserAlt, FaSyncAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaTiktok, FaTwitter, FaYoutube, FaBriefcase } from "react-icons/fa";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";

export default function AccountsView() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientMap, setClientMap] = useState<Record<number, string>>({});
  const [clientColorMap, setClientColorMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<Partial<Account>>({
    "account_id": "",
    "device_id": "",
    "client_id": 0,
    username: "",
    email: "",
    password: "",
    dob: "",
    platform: "",
    status: "active"
  });
  const [deviceModelMap, setDeviceModelMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [accountsData, clientsData, devicesData] = await Promise.all([
        getAccounts(),
        getClients(),
        getDevices()
      ]);
      
      // Build device model map: device_id -> model_type
      const modelMap: Record<string, string> = {};
      for (const device of devicesData) {
        if (device["device_id"] && device["model_type"]) {
          modelMap[device["device_id"]] = device["model_type"];
        }
      }
      setDeviceModelMap(modelMap);
      
      // Sort accounts by device ID numerically, with special devices at the end
      const sortedAccounts = [...accountsData].sort((a, b) => {
        // Extract numeric parts if they exist
        const aDeviceId = a["device_id"]?.toLowerCase() || "";
        const bDeviceId = b["device_id"]?.toLowerCase() || "";
        
        // Check if it's an iphone or shop device
        const aIsSpecial = aDeviceId.includes('iphone-') || aDeviceId.includes('shop-');
        const bIsSpecial = bDeviceId.includes('iphone-') || bDeviceId.includes('shop-');
        
        // If one is special and the other isn't, put the special one at the end
        if (aIsSpecial && !bIsSpecial) return 1;
        if (!aIsSpecial && bIsSpecial) return -1;
        
        // If both are special or both are not special, sort numerically
        const aNum = parseInt(aDeviceId.replace(/\D/g, '')) || 0;
        const bNum = parseInt(bDeviceId.replace(/\D/g, '')) || 0;
        return aNum - bNum;
      });
      
      setAccounts(sortedAccounts);
      setClients(clientsData);
      
      // Create client name and color maps for easy lookup
      const nameMap: Record<number, string> = {};
      const colorMap: Record<number, string> = {};
      for (const client of clientsData) {
        nameMap[client["client_id"]] = client.name;
        colorMap[client["client_id"]] = client.color;
      }
      setClientMap(nameMap);
      setClientColorMap(colorMap);
    } catch (err) {
      setError(err as Error);
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Get client name from client ID
  const getClientName = (clientId: number | undefined): string => {
    if (!clientId) return "No Client";
    return clientMap[clientId] || `Client ID: ${clientId}`;
  };

  // Get client color from client ID
  const getClientColor = (clientId: number | undefined): string => {
    if (!clientId) return "#FFFFFF"; // Default to white
    const color = clientColorMap[clientId] || "FFFFFF";
    return `#${color}`;
  };

  // Get client logo based on client ID
  const getClientLogo = (clientId: number | undefined): string => {
    if (!clientId) return "";
    
    // Return the path to the client logo
    return `/clients/${clientId}.png`;
  };

  // Improved getDeviceImage function that better uses the deviceModelMap
  const getDeviceImage = (deviceId: string): string => {
    if (!deviceId) return "/devices/unassigned.png";
    
    // Get model type from device model map
    const modelType = deviceModelMap[deviceId];
    
    if (!modelType) {
      // Special cases for device IDs without model info
      if (deviceId.toLowerCase().includes('iphone')) {
        return "/devices/IPHONE 15.png";
      }
      return "/devices/unassigned.png";
    }
    
    // Map of model types to image filenames
    const modelImageMap: Record<string, string> = {
      "A14": "/devices/A14.png",
      "A15": "/devices/A15.png",
      "A16": "/devices/A16.png",
      "A23": "/devices/A23.png",
      "A52": "/devices/A52.png",
      "S8": "/devices/S8.png",
      "S22": "/devices/S22.png",
      "IPHONE 15": "/devices/IPHONE 15.png",
      "MOTO G": "/devices/MOTO G.png",
      "PIXEL 6A": "/devices/PIXEL 6A.png"
    };
    
    // Normalize model type for comparison
    const normalizedModel = modelType.toUpperCase().trim();
    
    // Try exact matches first
    for (const [key, imagePath] of Object.entries(modelImageMap)) {
      if (normalizedModel === key) {
        return imagePath;
      }
    }
    
    // Try partial matches
    for (const [key, imagePath] of Object.entries(modelImageMap)) {
      if (normalizedModel.includes(key) || key.includes(normalizedModel)) {
        return imagePath;
      }
    }
    
    // Default image if no match found
    return "/devices/unassigned.png";
  };

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(
    (account) =>
      account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.platform.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account["device_id"] && account["device_id"].toLowerCase().includes(searchTerm.toLowerCase())) ||
      (account["client_id"] && 
        (account["client_id"].toString().includes(searchTerm) || 
         getClientName(account["client_id"]).toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "client_id" ? parseInt(value) || 0 : value
    });
  };

  // Edit an account
  const handleEdit = (account: Account) => {
    setCurrentAccount(account);
    setFormData(account);
    setIsEditing(true);
    setIsAdding(false);
  };

  // Add a new account
  const handleAdd = () => {
    setCurrentAccount(null);
    setFormData({
      "account_id": crypto.randomUUID(), // Generate a random UUID
      "device_id": "",
      "client_id": 0,
      username: "",
      email: "",
      password: "",
      dob: "",
      platform: "",
      status: "active" // Default to active
    });
    setIsAdding(true);
    setIsEditing(false);
  };

  // Delete an account
  const handleDelete = (accountId: string) => {
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      console.log(`Delete account with ID: ${accountId}`);
      setAccounts(accounts.filter(a => a["account_id"] !== accountId));
    }
  };

  // Save changes (update or create)
  const handleSave = () => {
    // Add validation as needed
    // ...

    if (isEditing) {
      // Update existing account
      const updatedAccounts = accounts.map(account => 
        account["account_id"] === currentAccount?.["account_id"] ? { ...account, ...formData } : account
      );
      setAccounts(updatedAccounts);
    } else if (isAdding) {
      // Add new account with current timestamp
      setAccounts([...accounts, { ...formData, "last_updated": new Date().toISOString() } as Account]);
    }
    
    // Reset form state
    setIsEditing(false);
    setIsAdding(false);
    setCurrentAccount(null);
    setFormData({
      "account_id": "",
      "device_id": "",
      "client_id": 0,
      username: "",
      email: "",
      password: "",
      dob: "",
      platform: "",
      status: "active"
    });
  };

  // Cancel editing/adding
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentAccount(null);
    setFormData({
      "account_id": "",
      "device_id": "",
      "client_id": 0,
      username: "",
      email: "",
      password: "",
      dob: "",
      platform: "",
      status: "active"
    });
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok':
        return <FaTiktok className="text-pink-400" />;
      case 'youtube':
        return <FaYoutube className="text-red-500" />;
      case 'x-twitter':
      case 'twitter':
        return <FaTwitter className="text-blue-400" />;
      default:
        return <FaUserAlt className="text-gray-400" />;
    }
  };

  // Get platform URL
  const getPlatformUrl = (platform: string, username: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok':
        return `https://tiktok.com/@${username}`;
      case 'youtube':
        return `https://youtube.com/@${username}`;
      case 'x-twitter':
      case 'twitter':
        return `https://twitter.com/${username}`;
      default:
        return '#';
    }
  };

  // Update status options with specific color coding to match Supabase values
  const statusOptions = [
    { value: "active", label: "Active", color: "bg-green-600 text-white" },
    { value: "idle", label: "Idle", color: "bg-yellow-500 text-white" },
    { value: "does not exist", label: "Does Not Exist", color: "bg-blue-700 text-white" },
    { value: "manual posting", label: "Manual Posting", color: "bg-orange-500 text-white" },
    { value: "not signed in", label: "Not Signed In", color: "bg-red-600 text-white" },
    { value: "temp-banned", label: "Temp-Banned", color: "bg-gray-600 text-white" },
    { value: "banned", label: "Banned", color: "bg-black text-white" }
  ];

  // Get status style based on status with consistent colors
  const getStatusStyle = (status: string) => {
    // Normalize status by converting to lowercase and trimming
    const normalizedStatus = status?.toLowerCase().trim() || "";
    
    // Find matching option
    const statusOption = statusOptions.find(opt => opt.value === normalizedStatus);
    
    // Use the matching color or default to purple for unknown statuses
    return statusOption?.color || "bg-purple-600 text-white";
  };

  // Handle status change with proper validation and error handling
  const handleStatusChange = async (accountId: string, newStatus: string) => {
    try {
      // If status is empty or undefined, default to a valid status
      if (!newStatus || newStatus.trim() === "") {
        newStatus = "active"; // Default to active if empty
      }
      
      // Update local state first for immediate UI feedback
      const updatedAccounts = accounts.map(account => 
        account["account_id"] === accountId 
          ? { ...account, status: newStatus, "last_updated": new Date().toISOString() } 
          : account
      );
      setAccounts(updatedAccounts);
      
      // Update the database
      const { data, error } = await supabase
        .from('accounts')
        .update({ status: newStatus, "last_updated": new Date().toISOString() })
        .eq('account_id', accountId);
        
      if (error) {
        console.error('Error updating account status:', error);
        // Revert on error
        loadData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      loadData();
    }
  };

  // First, add a helper function to get a darker shade of a color
  const getDarkerShade = (color: string): string => {
    // Remove the # if it exists
    const hexColor = color.replace('#', '');
    
    // Convert to RGB
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    
    // Make it darker (multiply by 0.7 to darken)
    const darkerR = Math.floor(r * 0.7);
    const darkerG = Math.floor(g * 0.7);
    const darkerB = Math.floor(b * 0.7);
    
    // Convert back to hex
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Accounts Management</h2>
        <div className="flex space-x-3">
          <button 
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={loadData}
          >
            <FaSyncAlt />
            <span>Refresh</span>
          </button>
          <button 
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={handleAdd}
          >
            <FaPlus />
            <span>Add Account</span>
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
              placeholder="Search accounts..."
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
            {isEditing ? "Edit Account" : "Add New Account"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Account ID - Hidden in edit mode since it's auto-generated */}
            {isAdding && (
              <div className="hidden">
                <input
                  type="text"
                  name="account_id"
                  value={formData["account_id"]}
                  readOnly
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username*
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="text"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Platform
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Platform</option>
                <option value="tiktok">TikTok</option>
                <option value="youtube">YouTube</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Device ID
              </label>
              <input
                type="text"
                name="device_id"
                value={formData["device_id"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Client
              </label>
              <select
                name="client_id"
                value={formData["client_id"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={0}>No Client</option>
                {clients.map(client => (
                  <option key={client.client_id} value={client.client_id} style={{color: `#${client.color}`}}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status || "active"}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
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

      {/* Accounts List */}
      {!isEditing && !isAdding && !error && (
        loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-8">
            <FaUserAlt className="text-4xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Accounts Found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm
                ? "No accounts match your search criteria."
                : "There are no accounts in the system yet."}
            </p>
            {!searchTerm && (
              <button 
                onClick={handleAdd}
                className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaPlus className="mr-2" />
                <span>Add your first account</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Username
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Device
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-bold">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredAccounts.map((account) => (
                  <tr key={account["account_id"]} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-2 text-lg">
                          {getPlatformIcon(account.platform)}
                        </div>
                        <a 
                          href={getPlatformUrl(account.platform, account.username)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          {account.username}
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {account.email || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 mr-2">
                          <Image
                            src={getDeviceImage(account.device_id || "")}
                            alt={account.device_id || "No device"}
                            width={32}
                            height={32}
                            className="rounded-sm object-contain"
                          />
                        </div>
                        <span className="text-sm text-gray-300">
                          {account["device_id"] || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span 
                          className="px-2 py-1 rounded-md text-sm font-medium inline-block"
                          style={{ 
                            backgroundColor: `${getClientColor(account["client_id"])}20`, // Add 20 as alpha for transparency
                            color: getDarkerShade(getClientColor(account["client_id"]))
                          }}
                        >
                          {getClientName(account["client_id"])}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <select
                        value={account.status || "active"}
                        onChange={(e) => handleStatusChange(account["account_id"], e.target.value)}
                        className="bg-transparent border-none text-gray-300 text-sm focus:ring-0 focus:outline-none cursor-pointer"
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(account)}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button 
                        onClick={() => handleDelete(account["account_id"])}
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