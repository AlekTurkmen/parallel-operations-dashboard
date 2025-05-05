"use client";

import { useEffect, useState } from "react";
import { Client } from "@/types";
import { getClients } from "@/lib/data";
import { FaBriefcase, FaSyncAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaExternalLinkAlt, FaEnvelope, FaStar } from "react-icons/fa";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";

export default function ClientsView() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentClient, setCurrentClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({
    "client_id": 0,
    name: "",
    qwilr: "",
    domain: "",
    "product_description": "",
    "contract_type": "",
    external_emails: [],
    active: true,
    "view_goal": 0,
    "billing_date": "",
    "billing_net_days": "",
    "billing_retainer": "",
    "billing_cpm": "",
    "billing_max": "",
    roi: "",
    sentiment: "",
    color: "FFFFFF"
  });

  // State for color picker
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [pickerPosition, setPickerPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    try {
      setLoading(true);
      const data = await getClients();
      setClients(data);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  }

  // Get client logo based on client ID
  const getClientLogo = (clientId: number): string => {
    if (!clientId) return "";
    
    // Check if the client logo exists
    try {
      return `/clients/${clientId}.png`;
    } catch (error) {
      console.error(`Error loading logo for client ${clientId}:`, error);
      return "";
    }
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.domain && client.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client["client_id"] && client["client_id"].toString().includes(searchTerm))
  );

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle checkbox inputs
    if (e.target.type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else if (name === "client_id" || name === "view_goal") {
      // Handle number inputs
      setFormData({
        ...formData,
        [name]: parseInt(value) || 0
      });
    } else {
      // Handle all other inputs
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Edit a client
  const handleEdit = (client: Client) => {
    // Format external_emails for editing
    const emailsString = Array.isArray(client.external_emails) 
      ? client.external_emails.join(', ')
      : typeof client.external_emails === 'object' && client.external_emails !== null
        ? JSON.stringify(client.external_emails)
        : '';
        
    setCurrentClient(client);
    setFormData({
      ...client,
      external_emails: emailsString
    });
    setIsEditing(true);
    setIsAdding(false);
  };

  // Add a new client
  const handleAdd = () => {
    setCurrentClient(null);
    // Set default values for a new client with next available ID
    setFormData({
      "client_id": clients.length > 0 ? Math.max(...clients.map(c => c["client_id"])) + 1 : 1,
      name: "",
      qwilr: "",
      domain: "",
      "product_description": "",
      "contract_type": "Retainer",
      external_emails: [],
      active: true,
      "view_goal": 0,
      "billing_date": "",
      "billing_net_days": "Net 30",
      "billing_retainer": "",
      "billing_cpm": "",
      "billing_max": "",
      roi: "",
      sentiment: "",
      color: "FFFFFF"
    });
    setIsAdding(true);
    setIsEditing(false);
  };

  // Delete a client
  const handleDelete = (clientId: number) => {
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      console.log(`Delete client with ID: ${clientId}`);
      setClients(clients.filter(c => c["client_id"] !== clientId));
    }
  };

  // Save changes (update or create)
  const handleSave = () => {
    if (!formData.name) {
      alert("Client name is required");
      return;
    }

    if (isEditing) {
      // Update existing client
      const updatedClients = clients.map(client => 
        client["client_id"] === currentClient?.["client_id"] ? { ...client, ...formData } : client
      );
      setClients(updatedClients);
    } else if (isAdding) {
      // Check if client ID already exists
      if (clients.some(c => c["client_id"] === formData["client_id"])) {
        alert("A client with this ID already exists");
        return;
      }
      
      // Add new client
      setClients([...clients, formData as Client]);
    }
    
    // Reset form state
    setIsEditing(false);
    setIsAdding(false);
    setCurrentClient(null);
    setFormData({
      "client_id": 0,
      name: "",
      qwilr: "",
      domain: "",
      "product_description": "",
      "contract_type": "",
      external_emails: [],
      active: true,
      "view_goal": 0,
      "billing_date": "",
      "billing_net_days": "",
      "billing_retainer": "",
      "billing_cpm": "",
      "billing_max": "",
      roi: "",
      sentiment: "",
      color: "FFFFFF"
    });
  };

  // Cancel editing/adding
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentClient(null);
    setFormData({
      "client_id": 0,
      name: "",
      qwilr: "",
      domain: "",
      "product_description": "",
      "contract_type": "",
      external_emails: [],
      active: true,
      "view_goal": 0,
      "billing_date": "",
      "billing_net_days": "",
      "billing_retainer": "",
      "billing_cpm": "",
      "billing_max": "",
      roi: "",
      sentiment: "",
      color: "FFFFFF"
    });
  };

  // Handle ROI or sentiment star rating change with auto-save
  const handleStarRating = async (clientId: number, field: 'roi' | 'sentiment', rating: number) => {
    try {
      // Update local state first for immediate UI feedback
      const updatedClients = clients.map(client => 
        client["client_id"] === clientId 
          ? { ...client, [field]: rating.toString(), "last_updated": new Date().toISOString() } 
          : client
      );
      setClients(updatedClients);
      
      // Update the database
      const { data, error } = await supabase
        .from('clients')
        .update({ [field]: rating.toString(), "last_updated": new Date().toISOString() })
        .eq('client_id', clientId);
        
      if (error) {
        console.error(`Error updating client ${field}:`, error);
        // Revert on error
        loadClients();
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      // Revert on error
      loadClients();
    }
  };

  // Handle status change with auto-save
  const handleStatusChange = async (clientId: number, isActive: boolean) => {
    try {
      // Update local state first for immediate UI feedback
      const updatedClients = clients.map(client => 
        client["client_id"] === clientId 
          ? { ...client, active: isActive, "last_updated": new Date().toISOString() } 
          : client
      );
      setClients(updatedClients);
      
      // Update the database
      const { data, error } = await supabase
        .from('clients')
        .update({ active: isActive, "last_updated": new Date().toISOString() })
        .eq('client_id', clientId);
        
      if (error) {
        console.error('Error updating client status:', error);
        // Revert on error
        loadClients();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Revert on error
      loadClients();
    }
  };

  // Handle client color change with auto-save
  const handleColorChange = async (clientId: number, newColor: string) => {
    try {
      // Remove # if present and ensure valid hex format
      newColor = newColor.replace(/^#/, '');
      // Only allow valid hex characters
      newColor = newColor.replace(/[^0-9A-Fa-f]/g, '');
      // Limit to 6 characters
      newColor = newColor.substring(0, 6);
      
      // Pad with zeros if needed (e.g., "FFF" becomes "FFFFFF")
      if (newColor.length === 3) {
        newColor = newColor.split('').map(c => c + c).join('');
      } else if (newColor.length < 6) {
        newColor = newColor.padEnd(6, '0');
      }
      
      // Update local state first for immediate UI feedback
      const updatedClients = clients.map(client => 
        client["client_id"] === clientId 
          ? { ...client, color: newColor, "last_updated": new Date().toISOString() } 
          : client
      );
      setClients(updatedClients);
      
      // Close color picker
      setColorPickerOpen(false);
      
      // Update the database
      const { data, error } = await supabase
        .from('clients')
        .update({ color: newColor, "last_updated": new Date().toISOString() })
        .eq('client_id', clientId);
        
      if (error) {
        console.error('Error updating client color:', error);
        // Revert on error
        loadClients();
      }
    } catch (error) {
      console.error('Error updating color:', error);
      // Revert on error
      loadClients();
    }
  };

  // Add a color picker component for client colors
  const ColorPicker = ({ color, onChange, onClose }: { color: string, onChange: (color: string) => void, onClose: () => void }) => {
    const [inputColor, setInputColor] = useState(color);
    
    // Common brand colors
    const presetColors = [
      'FF5733', // Red-Orange
      'FFC300', // Yellow
      '36D7B7', // Teal
      '3498DB', // Blue
      '9B59B6', // Purple
      'E74C3C', // Red
      '2ECC71', // Green
      'F39C12', // Orange
      '8E44AD', // Violet
      'D35400', // Dark Orange
      '27AE60', // Emerald
      '2980B9', // Strong Blue
      'CB4335', // Dark Red
      '1ABC9C', // Turquoise
      'F1C40F', // Sun Yellow
    ];

    return (
      <div className="absolute z-50 bg-gray-900 border border-gray-700 p-3 rounded-md shadow-lg" style={{ minWidth: '220px' }}>
        <div className="mb-3">
          <div className="flex items-center mb-2">
            <div 
              className="w-10 h-10 rounded-md mr-2 border border-gray-600"
              style={{ backgroundColor: `#${inputColor}` }}
            ></div>
            <div className="flex-1">
              <label className="block text-xs text-gray-400 mb-1">Hex Color</label>
              <div className="flex">
                <span className="bg-gray-800 border border-r-0 border-gray-600 rounded-l px-2 flex items-center text-gray-400">#</span>
                <input 
                  type="text" 
                  value={inputColor}
                  onChange={(e) => {
                    let hexColor = e.target.value.replace(/[^0-9A-Fa-f]/g, '').substring(0, 6);
                    setInputColor(hexColor);
                  }}
                  onBlur={() => onChange(inputColor)}
                  className="flex-1 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded-r focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="FFFFFF"
                />
              </div>
            </div>
          </div>
          <input 
            type="color"
            value={`#${inputColor || 'FFFFFF'}`}
            onChange={(e) => {
              const hexColor = e.target.value.substring(1);
              setInputColor(hexColor);
            }}
            className="h-8 w-full rounded p-1 bg-gray-800 border border-gray-600 mt-2"
          />
        </div>
        <div className="mb-2">
          <label className="block text-xs text-gray-400 mb-1">Preset Colors</label>
          <div className="grid grid-cols-5 gap-1 mb-2">
            {presetColors.map((presetColor) => (
              <div
                key={presetColor}
                className="w-8 h-8 rounded-md cursor-pointer hover:ring-2 hover:ring-white"
                style={{ backgroundColor: `#${presetColor}` }}
                onClick={() => {
                  setInputColor(presetColor);
                  onChange(presetColor);
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={() => onChange(inputColor)}
            className="text-xs px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white"
          >
            Apply
          </button>
          <button 
            onClick={onClose}
            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  // Create a star rating component
  const StarRating = ({ value, onChange }: { value: number, onChange: (rating: number) => void }) => {
    const [hover, setHover] = useState(0);
    
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`cursor-pointer ${
              star <= (hover || value) ? 'text-yellow-400' : 'text-gray-500'
            } hover:text-yellow-300 mr-1`}
            size={16}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Clients Management</h2>
        <div className="flex space-x-3">
          <button 
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={loadClients}
          >
            <FaSyncAlt />
            <span>Refresh</span>
          </button>
          <button 
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={handleAdd}
          >
            <FaPlus />
            <span>Add Client</span>
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
              placeholder="Search clients..."
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
            {isEditing ? "Edit Client" : "Add New Client"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Client ID
              </label>
              <input
                type="number"
                name="client_id"
                value={formData["client_id"]}
                onChange={handleInputChange}
                disabled={isEditing}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Client Name*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., ACME Corporation"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Active
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-300">Client is active</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Domain
              </label>
              <input
                type="text"
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., acme.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Qwilr URL
              </label>
              <input
                type="text"
                name="qwilr"
                value={formData.qwilr}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., https://qwilr.com/..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Product Description
              </label>
              <textarea
                name="product_description"
                value={formData["product_description"]}
                onChange={handleInputChange}
                rows={3}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe the client's product or service..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Contract Type
              </label>
              <select
                name="contract_type"
                value={formData["contract_type"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Retainer">Retainer</option>
                <option value="CPM">CPM</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Contacts
              </label>
              <input
                type="text"
                name="external_emails"
                value={typeof formData.external_emails === 'string' ? formData.external_emails : Array.isArray(formData.external_emails) ? formData.external_emails.join(', ') : ''}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., contact@example.com, sales@example.com"
              />
              <p className="text-xs text-gray-400 mt-1">Separate multiple emails with commas</p>
            </div>
            
            <div className="border-t border-gray-600 pt-4 md:col-span-2 mt-2">
              <h4 className="text-md font-medium mb-2">Billing Information</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Billing Date
              </label>
              <input
                type="text"
                name="billing_date"
                value={formData["billing_date"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 1st of month"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Net Terms
              </label>
              <select
                name="billing_net_days"
                value={formData["billing_net_days"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 45">Net 45</option>
                <option value="Net 60">Net 60</option>
              </select>
            </div>
            {formData["contract_type"] === "Retainer" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Retainer Amount
                </label>
                <input
                  type="text"
                  name="billing_retainer"
                  value={formData["billing_retainer"]}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            {formData["contract_type"] === "CPM" && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  CPM Rate
                </label>
                <input
                  type="text"
                  name="billing_cpm"
                  value={formData["billing_cpm"]}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Billing Max
              </label>
              <input
                type="text"
                name="billing_max"
                value={formData["billing_max"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                View Goal
              </label>
              <input
                type="number"
                name="view_goal"
                value={formData["view_goal"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., 50000"
              />
            </div>
            
            <div className="border-t border-gray-600 pt-4 md:col-span-2 mt-2">
              <h4 className="text-md font-medium mb-2">Client Rating</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                ROI Rating (1-5)
              </label>
              <div className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2">
                <StarRating 
                  value={parseInt(formData.roi || "0")}
                  onChange={(rating) => {
                    setFormData({
                      ...formData, 
                      roi: rating.toString()
                    });
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Sentiment Rating (1-5)
              </label>
              <div className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2">
                <StarRating 
                  value={parseInt(formData.sentiment || "0")}
                  onChange={(rating) => {
                    setFormData({
                      ...formData, 
                      sentiment: rating.toString()
                    });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Color picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Brand Color
                </label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-10 h-10 rounded-md border border-gray-600 flex-shrink-0"
                    style={{ backgroundColor: `#${formData.color || 'FFFFFF'}` }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex">
                      <span className="bg-gray-700 border border-r-0 border-gray-600 rounded-l px-2 flex items-center text-gray-400">#</span>
                      <input
                        type="text"
                        name="color"
                        value={formData.color || ""}
                        onChange={(e) => {
                          // Validate hex color
                          let hexColor = e.target.value.replace(/[^0-9A-Fa-f]/g, '');
                          hexColor = hexColor.substring(0, 6);
                          setFormData({
                            ...formData,
                            color: hexColor
                          });
                        }}
                        placeholder="FFFFFF"
                        className="flex-1 bg-gray-800 border border-gray-600 rounded-r px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  <input
                    type="color"
                    value={`#${formData.color || 'FFFFFF'}`}
                    onChange={(e) => {
                      // Remove the # from the hex color
                      const hexColor = e.target.value.substring(1);
                      setFormData({
                        ...formData,
                        color: hexColor
                      });
                    }}
                    className="h-10 w-12 rounded p-1 bg-gray-700 border border-gray-600"
                  />
                </div>
              </div>
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

      {/* Clients Grid */}
      {!isEditing && !isAdding && (
        loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <FaBriefcase className="text-4xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Clients Found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm
                ? "No clients match your search criteria."
                : "There are no clients in the system yet."}
            </p>
            {!searchTerm && (
              <button 
                onClick={handleAdd}
                className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FaPlus className="mr-2" />
                <span>Add your first client</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Qwilr
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    ROI
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Sentiment
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
                {filteredClients.map((client) => (
                  <tr key={client["client_id"]} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-5 h-5 rounded-full mr-2 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all duration-150"
                          style={{ backgroundColor: `#${client.color || 'FFFFFF'}` }}
                          onClick={(e) => {
                            setSelectedClient(client);
                            // Set position for color picker popup
                            const rect = e.currentTarget.getBoundingClientRect();
                            setPickerPosition({ 
                              x: rect.left,
                              y: rect.bottom + window.scrollY + 5
                            });
                            setColorPickerOpen(true);
                            // Prevent event bubbling
                            e.stopPropagation();
                          }}
                        ></div>
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex-shrink-0 mr-2 overflow-hidden rounded-sm">
                            <Image
                              src={`/clients/${client.client_id}.png`}
                              alt={client.name}
                              width={32}
                              height={32}
                              className="object-contain"
                              onError={(e) => {
                                // Fallback if image doesn't load
                                e.currentTarget.src = "/clients/-1.png";
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{client.name}</div>
                            <div className="text-xs text-gray-400">ID: {client["client_id"]}</div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {client.qwilr ? (
                        <a 
                          href={client.qwilr}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300"
                        >
                          Qwilr Link
                        </a>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <StarRating 
                        value={parseInt(client.roi) || 0} 
                        onChange={(rating) => handleStarRating(client["client_id"], 'roi', rating)} 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <StarRating 
                        value={parseInt(client.sentiment) || 0} 
                        onChange={(rating) => handleStarRating(client["client_id"], 'sentiment', rating)} 
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <select
                        value={client.active ? "active" : "inactive"}
                        onChange={(e) => handleStatusChange(client["client_id"], e.target.value === "active")}
                        className={`px-3 py-1 rounded-full text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                          client.active 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(client)}
                        className="text-indigo-400 hover:text-indigo-300 mr-3"
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button 
                        onClick={() => handleDelete(client["client_id"])}
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

      {/* Color Picker Dialog */}
      {colorPickerOpen && selectedClient && (
        <div
          style={{
            position: 'absolute',
            left: `${pickerPosition.x}px`,
            top: `${pickerPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <ColorPicker
            color={selectedClient.color || 'FFFFFF'}
            onChange={(color) => handleColorChange(selectedClient["client_id"], color)}
            onClose={() => setColorPickerOpen(false)}
          />
        </div>
      )}
    </div>
  );
} 