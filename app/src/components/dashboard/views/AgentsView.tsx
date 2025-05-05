"use client";

import { useEffect, useState } from "react";
import { Agent } from "@/types";
import { getAgents } from "@/lib/data";
import { FaNetworkWired, FaServer, FaSyncAlt, FaPlus, FaSearch, FaEdit, FaTrash } from "react-icons/fa";
import ErrorDisplay from "@/components/dashboard/ErrorDisplay";
import Image from "next/image";

export default function AgentsView() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<Partial<Agent>>({
    "agent_id": 0,
    "ip_address": "",
    type: ""
  });

  useEffect(() => {
    loadAgents();
  }, []);

  async function loadAgents() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      console.error("Error loading agents:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
      setAgents([]);
    } finally {
      setLoading(false);
    }
  }

  // Filter agents based on search term
  const filteredAgents = agents.filter(
    (agent) =>
      agent["agent_id"].toString().includes(searchTerm) ||
      agent["ip_address"].toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "agent_id" ? parseInt(value) || 0 : value
    });
  };

  // Edit an agent
  const handleEdit = (agent: Agent) => {
    setCurrentAgent(agent);
    setFormData(agent);
    setIsEditing(true);
    setIsAdding(false);
  };

  // Add a new agent
  const handleAdd = () => {
    setCurrentAgent(null);
    setFormData({
      "agent_id": agents.length > 0 ? Math.max(...agents.map(a => a["agent_id"])) + 1 : 1,
      "ip_address": "",
      type: "unassigned"
    });
    setIsAdding(true);
    setIsEditing(false);
  };

  // Delete an agent
  const handleDelete = (agentId: number) => {
    // Show confirmation dialog
    if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
      // In a real app, you would call an API to delete the agent
      console.log(`Delete agent with ID: ${agentId}`);
      // Then remove from local state
      setAgents(agents.filter(a => a["agent_id"] !== agentId));
    }
  };

  // Save changes (update or create)
  const handleSave = () => {
    if (isEditing) {
      // Update existing agent
      const updatedAgents = agents.map(agent => 
        agent["agent_id"] === currentAgent?.["agent_id"] ? { ...agent, ...formData } : agent
      );
      setAgents(updatedAgents);
    } else if (isAdding) {
      // Add new agent
      setAgents([...agents, formData as Agent]);
    }
    
    // Reset form state
    setIsEditing(false);
    setIsAdding(false);
    setCurrentAgent(null);
    setFormData({
      "agent_id": 0,
      "ip_address": "",
      type: ""
    });
  };

  // Cancel editing/adding
  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setCurrentAgent(null);
    setFormData({
      "agent_id": 0,
      "ip_address": "",
      type: ""
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Agents Management</h2>
        <div className="flex space-x-3">
          <button 
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={loadAgents}
          >
            <FaSyncAlt />
            <span>Refresh</span>
          </button>
          <button 
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            onClick={handleAdd}
          >
            <FaPlus />
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      {/* Display Error if any */}
      {error && <ErrorDisplay error={error} entityName="Agents" onRetry={loadAgents} />}

      {/* Search */}
      {!isEditing && !isAdding && !error && (
        <div className="mb-6">
          <div className="flex items-center bg-gray-700 rounded-lg px-3 py-2">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search agents..."
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
            {isEditing ? "Edit Agent" : "Add New Agent"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Agent ID
              </label>
              <input
                type="number"
                name="agent_id"
                value={formData["agent_id"]}
                onChange={handleInputChange}
                disabled={isEditing} // Can't change ID when editing
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                IP Address
              </label>
              <input
                type="text"
                name="ip_address"
                value={formData["ip_address"]}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="unassigned">Unassigned</option>
                <option value="usb-bridge">USB Bridge</option>
                <option value="emulator">Emulator</option>
                <option value="other">Other</option>
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

      {/* Agents List */}
      {!isEditing && !isAdding && !error && (
        loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-8">
            <FaServer className="text-4xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No Agents Found</h3>
            <p className="text-gray-400 mb-4">
              {searchTerm
                ? "No agents match your search criteria."
                : "There are no agents in the system yet."}
            </p>
            {!searchTerm && (
              <button 
                onClick={handleAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaPlus className="mr-2" />
                Add First Agent
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Agent ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredAgents.map((agent) => (
                  <tr key={agent["agent_id"]} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Image 
                          src="/mac.png" 
                          alt="Mac Mini" 
                          width={30} 
                          height={30} 
                          className="rounded-sm mr-2"
                        />
                        <div className="text-sm font-medium text-white">{agent["agent_id"]}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{agent["ip_address"]}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        agent.type === 'usb-bridge' ? 'bg-green-100 text-green-800' : 
                        agent.type === 'unassigned' ? 'bg-gray-100 text-gray-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {agent.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(agent["last_updated"]).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(agent)}
                        className="text-indigo-400 hover:text-indigo-300 mr-4"
                      >
                        <FaEdit className="inline" />
                      </button>
                      <button 
                        onClick={() => handleDelete(agent["agent_id"])}
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