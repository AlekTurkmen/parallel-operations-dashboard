"use client";

import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

interface DeviceSelectorProps {
  deviceNumbers: string[];
  currentDeviceNumber: string;
  onDeviceChange: (deviceNumber: string) => void;
}

// Helper function to clean the device number for display
const cleanDeviceNumber = (deviceNumber: string): string => {
  return deviceNumber.replace(/^#/, '');
};

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  deviceNumbers,
  currentDeviceNumber,
  onDeviceChange
}) => {
  return (
    <Card className="skeuomorphic">
      <CardHeader className="bg-gray-900/50">
        <CardTitle>Select Device</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <Select
            value={currentDeviceNumber}
            onValueChange={onDeviceChange}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Select a device" />
            </SelectTrigger>
            <SelectContent>
              {deviceNumbers.map((number) => (
                <SelectItem key={number} value={number}>
                  Device #{cleanDeviceNumber(number)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceSelector; 