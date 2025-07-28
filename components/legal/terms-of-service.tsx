"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  FileText,
  AlertTriangle,
  Shield,
  Users,
  Gavel,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface TermsOfServiceProps {
  onBack?: () => void;
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: FileText },
    { id: "usage", title: "Acceptable Use", icon: Users },
    { id: "google", title: "Google Auth", icon: Shield },
    { id: "liability", title: "Liability", icon: AlertTriangle },
    { id: "legal", title: "Legal", icon: Gavel },
  ];

  return (
    <div className="h-full full-viewport overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="mobile-container pt-4 pb-6">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="touch-target"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Logo size="md" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Usage terms and conditions
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="mobile-container mb-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className="whitespace-nowrap touch-target"
            >
              <section.icon className="w-4 h-4 mr-2" />
              {section.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mobile-container pb-20">
        {activeSection === "overview" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Terms Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                These Terms of Service ("Terms") govern your use of the{" "}
                <strong>Biaz</strong> crypto exchange application. By using our
                service, you agree to these terms and our Privacy Policy.
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold text-base">Key Terms:</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-600">
                  <li>You must be 18+ years old to use our services</li>
                  <li>You are responsible for your account security</li>
                  <li>
                    We provide crypto exchange services, not financial advice
                  </li>
                  <li>Cryptocurrency trading involves significant risk</li>
                  <li>We may update these terms with notice</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Effective Date:</strong>{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "usage" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">You May:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Use our services for legitimate crypto trading</li>
                    <li>Connect your own wallets to our platform</li>
                    <li>Access market data and trading tools</li>
                    <li>Contact support for legitimate issues</li>
                    <li>Use Google authentication for account access</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">You May NOT:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Use our services for illegal activities</li>
                    <li>Attempt to hack or compromise our systems</li>
                    <li>Share your account with others</li>
                    <li>Use automated bots without permission</li>
                    <li>Attempt to manipulate market prices</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 text-sm">
                    <strong>Warning:</strong> Violation of these terms may
                    result in account suspension or termination.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "google" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Google Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-4">
                <p>
                  When you choose to use Google authentication, you agree to
                  additional terms and conditions.
                </p>

                <div>
                  <h3 className="font-semibold mb-2">Google Auth Terms:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>You must comply with Google's Terms of Service</li>
                    <li>
                      You authorize us to access your basic Google profile
                      information
                    </li>
                    <li>
                      You can revoke our access to your Google data at any time
                    </li>
                    <li>
                      We will only use Google data for authentication purposes
                    </li>
                    <li>Your Google account must be in good standing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Your Responsibilities:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Keep your Google account secure</li>
                    <li>
                      Enable two-factor authentication on your Google account
                    </li>
                    <li>Notify us if your Google account is compromised</li>
                    <li>Ensure your Google account information is accurate</li>
                    <li>Comply with Google's privacy and security policies</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Note:</strong> We are not responsible for issues
                    with your Google account or Google's services. Google
                    authentication is provided as a convenience and is subject
                    to Google's own terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "liability" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Liability & Disclaimers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Risk Disclaimers:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>
                      <strong>Crypto Trading Risk:</strong> Cryptocurrency
                      prices are highly volatile
                    </li>
                    <li>
                      <strong>No Financial Advice:</strong> We do not provide
                      investment advice
                    </li>
                    <li>
                      <strong>Market Risk:</strong> You may lose money trading
                      cryptocurrencies
                    </li>
                    <li>
                      <strong>Regulatory Risk:</strong> Crypto regulations may
                      change
                    </li>
                    <li>
                      <strong>Technical Risk:</strong> Blockchain networks may
                      experience issues
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Limitation of Liability:
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>We are not liable for trading losses</li>
                    <li>We are not liable for wallet security issues</li>
                    <li>We are not liable for Google service disruptions</li>
                    <li>We are not liable for blockchain network issues</li>
                    <li>Our liability is limited to the fees you paid us</li>
                  </ul>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-orange-800 dark:text-orange-200 text-sm">
                    <strong>Important:</strong> Only trade with money you can
                    afford to lose. Cryptocurrency trading is not suitable for
                    everyone.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "legal" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Legal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Governing Law:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>These terms are governed by applicable laws</li>
                    <li>Disputes will be resolved through arbitration</li>
                    <li>You waive your right to class action lawsuits</li>
                    <li>Small claims court actions are permitted</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Changes to Terms:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>We may update these terms with 30 days notice</li>
                    <li>Continued use constitutes acceptance of changes</li>
                    <li>You can terminate your account if you disagree</li>
                    <li>Material changes will be prominently notified</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Contact Information:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Email: spectra010s@gmail.com</li>
                    <li>WhatsApp: +234 901 300 4266</li>
                    <li>Support: Available through the app</li>
                    <li>Legal Inquiries: Use email contact</li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
                  <p className="text-gray-800 dark:text-gray-200 text-sm">
                    <strong>Severability:</strong> If any part of these terms is
                    found to be unenforceable, the remaining terms will continue
                    to be effective.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
