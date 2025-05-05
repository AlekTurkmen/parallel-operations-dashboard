"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Device } from "../types/device";
import { updateDeviceData } from "../lib/supabase-operations";
import Image from "next/image";

interface DevicesPanelProps {
  currentDeviceNumber: string;
  currentDevice: Device | undefined;
  onDeviceUpdate: (updatedDevice: Device) => void;
}

// Helper function to get device image based on model
const getDeviceImage = (model: string, deviceNumber: string): string => {
  // If no model provided or model is "unassigned", use the unassigned image
  if (!model || model.trim() === "" || model.toLowerCase() === "unassigned") {
    return "/unassigned.png";
  }

  // Special case for iphone-1 - always use iPhone 15 image
  if (deviceNumber === 'iphone-1' || deviceNumber === 'iphone_1') {
    return `/iPhone 15.png`;
  }
  
  // Models might be written in different formats, normalize them for matching
  const normalizedModel = model.trim().toUpperCase();
  
  // Map of normalized model names to actual image filenames
  const modelImageMap: Record<string, string> = {
    "A14": "A14.png",
    "A15": "A15.png",
    "A16": "A16.png",
    "A23": "A23.png",
    "A52": "A52.png",
    "S8": "S8.png",
    "S22": "S22.png",
    "IPHONE 15": "iPhone 15.png",
    "IPHONE15": "iPhone 15.png",
    "MOTO G": "MOTO G.png",
    "MOTOG": "MOTO G.png",
    "PIXEL 6A": "PIXEL 6A.png",
    "PIXEL6A": "PIXEL 6A.png"
  };
  
  // Check for the normalized model in our map
  for (const [modelKey, imagePath] of Object.entries(modelImageMap)) {
    if (normalizedModel.includes(modelKey) || modelKey.includes(normalizedModel)) {
      return `/${imagePath}`;
    }
  }
  
  // Try to match with available image files directly if not found in the map
  const availableImages = ["A14", "A15", "A52", "S22", "iPhone 15", "MOTO G", "A23", "PIXEL 6A", "S8", "A16"];
  
  for (const availableImage of availableImages) {
    if (normalizedModel.includes(availableImage.toUpperCase()) || 
        availableImage.toUpperCase().includes(normalizedModel)) {
      return `/${availableImage}.png`;
    }
  }
  
  // Default to unassigned.png if no match found
  return "/unassigned.png";
};

const DevicesPanel: React.FC<DevicesPanelProps> = ({
  currentDeviceNumber,
  currentDevice,
  onDeviceUpdate
}) => {
  const [editing, setEditing] = useState(false);
  const [editedDevice, setEditedDevice] = useState<Device | undefined>(currentDevice);
  const [isSaving, setIsSaving] = useState(false);

  // Update the edited device when the current device changes
  React.useEffect(() => {
    setEditedDevice(currentDevice);
  }, [currentDevice]);

  if (!currentDevice) {
    return <div>No device selected</div>;
  }

  const handleInputChange = (field: keyof Device, value: string) => {
    if (editedDevice) {
      setEditedDevice({
        ...editedDevice,
        [field]: value
      });
    }
  };

  const handleSave = async () => {
    if (!editedDevice) return;
    
    setIsSaving(true);
    try {
      // Call the function to update the device in Supabase
      await updateDeviceData(editedDevice, currentDeviceNumber);
      
      // Notify parent component about the update
      onDeviceUpdate(editedDevice);
      
      // Exit edit mode
      setEditing(false);
    } catch (error) {
      console.error("Error saving device data:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setEditedDevice(currentDevice);
    setEditing(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="phone-container skeuomorphic max-w-[320px] mx-auto md:mx-0">
        <img 
          src={getDeviceImage(currentDevice.model, currentDeviceNumber)} 
          alt="Phone" 
          className="w-full object-contain"
          style={{ maxWidth: "100%", display: "block" }}
        />
      </div>

      <Card className="skeuomorphic h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Device Information</CardTitle>
          {!editing ? (
            <Button variant="outline" onClick={() => setEditing(true)}>
              Edit
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Serial Number</p>
              {editing ? (
                <Input 
                  value={editedDevice?.serialNumber} 
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                />
              ) : (
                <p>{currentDevice.serialNumber}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Model</p>
              {editing ? (
                <Input 
                  value={editedDevice?.model} 
                  onChange={(e) => handleInputChange('model', e.target.value)}
                />
              ) : (
                <p>{currentDevice.model}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              {editing ? (
                <Input 
                  value={editedDevice?.phoneNumber} 
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                />
              ) : (
                <p>{currentDevice.phoneNumber}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile Carrier</p>
              {editing ? (
                <Input 
                  value={editedDevice?.mobileCarrier} 
                  onChange={(e) => handleInputChange('mobileCarrier', e.target.value)}
                />
              ) : (
                <p>{currentDevice.mobileCarrier}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IMEI</p>
              {editing ? (
                <Input 
                  value={editedDevice?.imei} 
                  onChange={(e) => handleInputChange('imei', e.target.value)}
                />
              ) : (
                <p>{currentDevice.imei}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AirDroid Link</p>
              <a 
                href={currentDevice.airDroidLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline"
              >
                Open AirDroid
              </a>
            </div>
          </div>
        </CardContent>
        {editing && (
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default DevicesPanel; 