"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Device } from "../types/device";
import { updateAccountData } from "../lib/supabase-operations";

interface AccountsPanelProps {
  accounts: Device[];
  deviceNumber: string;
  onAccountUpdate: (updatedAccounts: Device[]) => void;
}

// Function to get a color based on client name for consistent color coding
const getClientColor = (clientName: string): string => {
  const colors = [
    "#9333EA", // Purple
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#EC4899", // Pink
    "#06B6D4", // Cyan
    "#8B5CF6", // Indigo
  ];
  
  // Hash the client name to get a consistent index
  let hash = 0;
  for (let i = 0; i < clientName.length; i++) {
    hash = clientName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Function to generate the correct platform URL
const getPlatformUrl = (platform: string, handle: string): string => {
  if (!handle) return '';
  
  // Remove @ symbol from handle if it exists
  const cleanHandle = handle.replace(/^@/, '');
  
  switch(platform.toLowerCase()) {
    case 'tiktok':
      return `https://www.tiktok.com/@${cleanHandle}`;
    case 'youtube':
      return `https://www.youtube.com/${cleanHandle}`;
    case 'x-twitter':
    case 'twitter':
    case 'x':
      return `https://x.com/${cleanHandle}`;
    default:
      return '';
  }
};

// Component to handle @ symbol display explicitly
const AtSymbolText = ({ text }: { text: string }) => {
  if (!text) return null;
  
  // If text doesn't contain @, return it directly
  if (!text.includes('@')) {
    return <span>{text}</span>;
  }
  
  // Split by @ and join with styled spans
  const parts = text.split('@');
  
  return (
    <span className="at-wrapper">
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="at-symbol">@</span>
          )}
          {part}
        </React.Fragment>
      ))}
    </span>
  );
};

const AccountsPanel: React.FC<AccountsPanelProps> = ({ accounts, deviceNumber, onAccountUpdate }) => {
  const [editingAccountIndex, setEditingAccountIndex] = useState<number | null>(null);
  const [editedAccount, setEditedAccount] = useState<Device | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});

  const handleEdit = (account: Device, index: number) => {
    setEditedAccount({...account});
    setEditingAccountIndex(index);
  };

  const handleCancel = () => {
    setEditedAccount(null);
    setEditingAccountIndex(null);
  };

  const handleSave = async (index: number) => {
    if (!editedAccount) return;
    
    setIsSaving(true);
    try {
      // Call the function to update the account in Supabase
      await updateAccountData(editedAccount, deviceNumber, index);
      
      // Update the local state
      const updatedAccounts = [...accounts];
      updatedAccounts[index] = editedAccount;
      
      // Notify parent component about the update
      onAccountUpdate(updatedAccounts);
      
      // Exit edit mode
      setEditingAccountIndex(null);
      setEditedAccount(null);
    } catch (error) {
      console.error("Error saving account data:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof Device, value: string) => {
    if (editedAccount) {
      setEditedAccount({
        ...editedAccount,
        [field]: value
      });
    }
  };

  const togglePasswordVisibility = (index: number) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Card className="skeuomorphic overflow-hidden">
      <CardHeader className="bg-gray-900/50">
        <CardTitle>Accounts for Device {deviceNumber}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-gray-900/30">
                <TableHead className="w-[160px]">TikTok Handle</TableHead>
                <TableHead className="w-[160px]">Client</TableHead>
                <TableHead className="w-[140px]">Platform</TableHead>
                <TableHead className="w-[200px]">Email</TableHead>
                <TableHead className="w-[160px]">Password</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length > 0 ? (
                accounts.map((account, index) => {
                  const clientColor = getClientColor(account.client);
                  const platformUrl = getPlatformUrl(account.platform, account.tikTokHandle);
                  const isEditing = editingAccountIndex === index;
                  const isPasswordRevealed = revealedPasswords[index];
                  
                  return (
                    <TableRow key={index} className="hover:bg-gray-900/20">
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            value={editedAccount?.tikTokHandle || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tikTokHandle', e.target.value)}
                            className="max-w-[140px]"
                          />
                        ) : (
                          <div className="flex items-center">
                            {account.tikTokHandle ? (
                              <a 
                                href={platformUrl || account.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary hover:underline truncate max-w-[140px]"
                                title={account.tikTokHandle}
                              >
                                <AtSymbolText text={account.tikTokHandle} />
                              </a>
                            ) : (
                              <span className="text-gray-400">No handle</span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            value={editedAccount?.client || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('client', e.target.value)}
                            className="max-w-[140px]"
                          />
                        ) : (
                          <div className="flex items-center">
                            <span className="color-tag" style={{ backgroundColor: clientColor }}></span>
                            <span className="truncate max-w-[140px]" title={account.client}>
                              {account.client}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            value={editedAccount?.platform || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('platform', e.target.value)}
                            className="max-w-[120px]"
                          />
                        ) : (
                          <span className="truncate block max-w-[120px]" title={account.platform}>
                            {account.platform}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            value={editedAccount?.clientEmail || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('clientEmail', e.target.value)}
                            className="max-w-[180px]"
                          />
                        ) : (
                          <span 
                            className="truncate block max-w-[180px]" 
                            title={account.clientEmail}
                          >
                            {account.clientEmail ? 
                              <AtSymbolText text={account.clientEmail} /> : 
                              <span className="text-gray-400">No email</span>
                            }
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            type={isPasswordRevealed ? "text" : "password"}
                            value={editedAccount?.password || ''} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                            className="max-w-[140px]"
                          />
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="truncate max-w-[100px]">
                              {isPasswordRevealed ? account.password : 
                               account.password ? '••••••••' : 
                               <span className="text-gray-400">No password</span>}
                            </span>
                            {account.password && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => togglePasswordVisibility(index)}
                              >
                                {isPasswordRevealed ? 
                                  <EyeOff className="h-4 w-4" /> : 
                                  <Eye className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={handleCancel}
                              disabled={isSaving}
                              className="px-2 h-8"
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => handleSave(index)}
                              disabled={isSaving}
                              className="px-2 h-8"
                            >
                              {isSaving ? "..." : "Save"}
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(account, index)}
                            className="px-2 h-8"
                          >
                            Edit
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">No accounts found for this device.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountsPanel; 