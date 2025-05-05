"use client";

import { useEffect, useState } from "react";
import { EntityCard } from "@/components/dashboard/EntityCard";
import { EntityCounts, EntityType } from "@/types";
import { getEntityCounts } from "@/lib/data";
import { FaServer, FaMobile, FaUserAlt, FaBriefcase } from "react-icons/fa";
import AgentsView from "@/components/dashboard/views/AgentsView";
import DevicesView from "@/components/dashboard/views/DevicesView";
import AccountsView from "@/components/dashboard/views/AccountsView";
import ClientsView from "@/components/dashboard/views/ClientsView";

export default function DashboardPage() {
  const [counts, setCounts] = useState<EntityCounts>({
    agents: 0,
    devices: 0,
    accounts: 0,
    clients: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<EntityType>("agents");

  useEffect(() => {
    async function loadCounts() {
      try {
        const data = await getEntityCounts();
        setCounts(data);
      } catch (error) {
        console.error("Error loading entity counts:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCounts();
  }, []);

  // Function to handle tab change when entity card is clicked
  const handleTabChange = (tab: EntityType) => {
    setActiveTab(tab);
  };

  // Render the active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "agents":
        return <AgentsView />;
      case "devices":
        return <DevicesView />;
      case "accounts":
        return <AccountsView />;
      case "clients":
        return <ClientsView />;
      default:
        return <AgentsView />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Operations Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Entity cards as tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div 
                onClick={() => handleTabChange("agents")}
                className={activeTab === "agents" ? "transform scale-105 transition-transform duration-200" : ""}
              >
                <EntityCard
                  title="AGENTS"
                  count={counts.agents}
                  entityType="agents"
                  description="Physical Mac hosts"
                  color="red"
                  icon={<FaServer />}
                  isActive={activeTab === "agents"}
                  onClick={() => {}} // Handling click in parent div
                />
              </div>
              
              <div 
                onClick={() => handleTabChange("devices")}
                className={activeTab === "devices" ? "transform scale-105 transition-transform duration-200" : ""}
              >
                <EntityCard
                  title="DEVICES"
                  count={counts.devices}
                  entityType="devices"
                  description="Phones and emulators"
                  color="blue"
                  icon={<FaMobile />}
                  isActive={activeTab === "devices"}
                  onClick={() => {}} // Handling click in parent div
                />
              </div>
              
              <div 
                onClick={() => handleTabChange("accounts")}
                className={activeTab === "accounts" ? "transform scale-105 transition-transform duration-200" : ""}
              >
                <EntityCard
                  title="ACCOUNTS"
                  count={counts.accounts}
                  entityType="accounts"
                  description="Social media handles"
                  color="green"
                  icon={<FaUserAlt />}
                  isActive={activeTab === "accounts"}
                  onClick={() => {}} // Handling click in parent div
                />
              </div>
              
              <div 
                onClick={() => handleTabChange("clients")}
                className={activeTab === "clients" ? "transform scale-105 transition-transform duration-200" : ""}
              >
                <EntityCard
                  title="CLIENTS"
                  count={counts.clients}
                  entityType="clients"
                  description="Paying brands"
                  color="yellow"
                  icon={<FaBriefcase />}
                  isActive={activeTab === "clients"}
                  onClick={() => {}} // Handling click in parent div
                />
              </div>
            </div>
            
            {/* Content area for the active tab */}
            <div className="mb-8">
              {renderActiveTabContent()}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 