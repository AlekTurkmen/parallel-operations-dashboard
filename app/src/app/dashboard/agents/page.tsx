"use client";

import { useEffect, useState } from "react";
import { Agent } from "@/types";
import { getAgents } from "@/lib/data";
import { FaNetworkWired, FaServer, FaSyncAlt, FaPlus, FaSearch } from "react-icons/fa";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadAgents() {
      try {
        const data = await getAgents();
        setAgents(data);
      } catch (error) {
        console.error("Error loading agents:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAgents();
  }, []);

  // Filter agents based on search term
  const filteredAgents = agents.filter(
    (agent) =>
      agent.agent_id.toString().includes(searchTerm) ||
      agent.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Agents</h1>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <FaSyncAlt />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
            <FaPlus />
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <FaServer className="text-4xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">No Agents Found</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm
              ? "No agents match your search criteria."
              : "There are no agents in the system yet."}
          </p>
          <button className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
            <FaPlus className="mr-2" />
            <span>Add your first agent</span>
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  IP Address
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Last Updated
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {filteredAgents.map((agent) => (
                <tr key={agent.agent_id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {agent.agent_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center">
                      <FaNetworkWired className="mr-2 text-indigo-400" />
                      {agent.ip_address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {agent.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {new Date(agent.last_updated).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <button className="text-indigo-400 hover:text-indigo-300 mr-3">
                      Edit
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 