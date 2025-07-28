"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  Plus,
  Download,
  Upload,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  AlertCircle,
  Shield,
  Key,
  Seedling,
} from "lucide-react";
import { useCustomAuth } from "@/hooks/use-custom-auth";
import { useToast } from "@/hooks/use-toast";
import { WALLET_CONFIG } from "@/lib/auth-config";

interface WalletManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WalletManager({ isOpen, onClose }: WalletManagerProps) {
  const { createWallet, importWallet, backupWallet, walletInfo } =
    useCustomAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("create");
  const [selectedChain, setSelectedChain] = useState("ethereum");
  const [privateKey, setPrivateKey] = useState("");
  const [seedPhrase, setSeedPhrase] = useState("");
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [backupData, setBackupData] = useState<string>("");

  const handleCreateWallet = async () => {
    if (!selectedChain) {
      toast({
        title: "Error",
        description: "Please select a blockchain",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const wallet = await createWallet(selectedChain as any);

      // Show backup data
      const backup = await backupWallet();
      setBackupData(backup);

      toast({
        title: "Success",
        description: `${
          selectedChain.charAt(0).toUpperCase() + selectedChain.slice(1)
        } wallet created successfully`,
      });

      // Switch to backup tab
      setActiveTab("backup");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create wallet",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportWallet = async () => {
    if (!selectedChain) {
      toast({
        title: "Error",
        description: "Please select a blockchain",
        variant: "destructive",
      });
      return;
    }

    const importData = privateKey || seedPhrase;
    if (!importData) {
      toast({
        title: "Error",
        description: "Please enter private key or seed phrase",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      await importWallet(selectedChain as any, importData);

      toast({
        title: "Success",
        description: "Wallet imported successfully",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to import wallet",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const downloadBackup = () => {
    const blob = new Blob([backupData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedChain}-wallet-backup.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setSelectedChain("ethereum");
    setPrivateKey("");
    setSeedPhrase("");
    setShowPrivateKey(false);
    setShowSeedPhrase(false);
    setBackupData("");
    setActiveTab("create");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Manager
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plus className="w-5 h-5" />
                  Create New Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chain-select">Select Blockchain</Label>
                  <Select
                    value={selectedChain}
                    onValueChange={setSelectedChain}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose blockchain" />
                    </SelectTrigger>
                    <SelectContent>
                      {WALLET_CONFIG.supportedChains.map((chain) => (
                        <SelectItem key={chain.id} value={chain.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {chain.id === "ethereum"
                                ? "🌐"
                                : chain.id === "solana"
                                ? "☀️"
                                : chain.id === "sui"
                                ? "💎"
                                : chain.id === "cosmos"
                                ? "🌌"
                                : "🔗"}
                            </span>
                            {chain.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Security Notice</p>
                      <p>
                        Your wallet will be created locally and encrypted.
                        You'll receive a backup phrase that you must save
                        securely.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCreateWallet}
                  disabled={isCreating}
                  className="w-full"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Wallet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="w-5 h-5" />
                  Import Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-chain-select">Select Blockchain</Label>
                  <Select
                    value={selectedChain}
                    onValueChange={setSelectedChain}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose blockchain" />
                    </SelectTrigger>
                    <SelectContent>
                      {WALLET_CONFIG.supportedChains.map((chain) => (
                        <SelectItem key={chain.id} value={chain.id}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">
                              {chain.id === "ethereum"
                                ? "🌐"
                                : chain.id === "solana"
                                ? "☀️"
                                : chain.id === "sui"
                                ? "💎"
                                : chain.id === "cosmos"
                                ? "🌌"
                                : "🔗"}
                            </span>
                            {chain.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="private-key">Private Key</Label>
                    <div className="relative">
                      <Input
                        id="private-key"
                        type={showPrivateKey ? "text" : "password"}
                        placeholder="Enter private key"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPrivateKey(!showPrivateKey)}
                      >
                        {showPrivateKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seed-phrase">
                      Seed Phrase (12/24 words)
                    </Label>
                    <div className="relative">
                      <Input
                        id="seed-phrase"
                        type={showSeedPhrase ? "text" : "password"}
                        placeholder="Enter seed phrase"
                        value={seedPhrase}
                        onChange={(e) => setSeedPhrase(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowSeedPhrase(!showSeedPhrase)}
                      >
                        {showSeedPhrase ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <p className="font-medium mb-1">Important</p>
                      <p>
                        Only import wallets you own. Never share your private
                        key or seed phrase with anyone.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleImportWallet}
                  disabled={isImporting || (!privateKey && !seedPhrase)}
                  className="w-full"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Wallet
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Key className="w-5 h-5" />
                  Backup Your Wallet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {backupData ? (
                  <>
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="text-sm text-green-700 dark:text-green-300">
                          <p className="font-medium mb-1">
                            Wallet Created Successfully!
                          </p>
                          <p>
                            Please save your backup data securely. You won't be
                            able to see it again.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Backup Data</Label>
                      <div className="relative">
                        <Input
                          value={backupData}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => copyToClipboard(backupData)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={downloadBackup}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={() => {
                          toast({
                            title: "Success",
                            description: "Wallet setup complete!",
                          });
                          onClose();
                        }}
                        className="flex-1"
                      >
                        Done
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Seedling className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">
                      Create a wallet first to see backup data
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
 