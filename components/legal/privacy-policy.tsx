"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Eye, Database, Globe, Lock } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface PrivacyPolicyProps {
  onBack?: () => void;
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "Overview", icon: Shield },
    { id: "collection", title: "Data Collection", icon: Database },
    { id: "google", title: "Google Auth", icon: Globe },
    { id: "usage", title: "Data Usage", icon: Eye },
    { id: "security", title: "Security", icon: Lock },
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
            Privacy Policy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            How we protect and handle your data
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
                <Shield className="w-5 h-5" />
                Privacy Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                <strong>Biaz</strong> ("we," "our," or "us") is committed to
                protecting your privacy. This Privacy Policy explains how we
                collect, use, and safeguard your information when you use our
                crypto exchange application.
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold text-base">Key Points:</h3>
                <ul className="space-y-2 list-disc list-inside text-gray-600">
                  <li>
                    We collect only necessary information to provide our
                    services
                  </li>
                  <li>
                    Your wallet data remains private and is not stored on our
                    servers
                  </li>
                  <li>
                    Google authentication data is handled according to Google's
                    privacy standards
                  </li>
                  <li>
                    We use industry-standard encryption to protect your data
                  </li>
                  <li>You can request deletion of your data at any time</li>
                </ul>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Last Updated:</strong>{" "}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "collection" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Collection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    Information We Collect:
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>
                      <strong>Account Information:</strong> Email, phone number,
                      username
                    </li>
                    <li>
                      <strong>Authentication Data:</strong> Google OAuth
                      information (name, email, profile picture)
                    </li>
                    <li>
                      <strong>Device Information:</strong> IP address, device
                      type, browser information
                    </li>
                    <li>
                      <strong>Usage Data:</strong> App interactions, transaction
                      history, preferences
                    </li>
                    <li>
                      <strong>Wallet Addresses:</strong> Public blockchain
                      addresses you connect
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Information We Do NOT Collect:
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Private keys or seed phrases</li>
                    <li>Wallet passwords or PINs</li>
                    <li>
                      Personal financial information beyond what's on the
                      blockchain
                    </li>
                    <li>Biometric data (unless explicitly enabled by you)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "google" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Google Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-4">
                <p>
                  When you choose to sign in with Google, we follow Google's
                  OAuth 2.0 standards and privacy practices.
                </p>

                <div>
                  <h3 className="font-semibold mb-2">Google Data We Access:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Basic profile information (name, email address)</li>
                    <li>Profile picture (if you have one)</li>
                    <li>Google account ID for authentication purposes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    How We Use Google Data:
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Create and manage your Biaz account</li>
                    <li>Provide personalized user experience</li>
                    <li>Send important account notifications</li>
                    <li>Prevent fraud and ensure account security</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Note:</strong> We never access your Google Drive,
                    Gmail, or other Google services. We only use the basic
                    profile information you authorize during sign-in.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Your Google Privacy Rights:
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>
                      You can revoke our access to your Google data at any time
                    </li>
                    <li>You can manage your Google account permissions</li>
                    <li>
                      You can delete your Biaz account and associated data
                    </li>
                    <li>You can contact us to request data deletion</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "usage" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Data Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">How We Use Your Data:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>
                      <strong>Service Provision:</strong> Provide crypto
                      exchange services
                    </li>
                    <li>
                      <strong>Account Management:</strong> Create and maintain
                      your account
                    </li>
                    <li>
                      <strong>Security:</strong> Protect against fraud and
                      unauthorized access
                    </li>
                    <li>
                      <strong>Communication:</strong> Send important updates and
                      notifications
                    </li>
                    <li>
                      <strong>Improvement:</strong> Analyze usage to improve our
                      services
                    </li>
                    <li>
                      <strong>Compliance:</strong> Meet legal and regulatory
                      requirements
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Data Sharing:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>
                      <strong>Never:</strong> Sell your personal data to third
                      parties
                    </li>
                    <li>
                      <strong>Limited:</strong> Share with service providers
                      (email, SMS, cloud storage)
                    </li>
                    <li>
                      <strong>Required:</strong> Share when required by law or
                      regulation
                    </li>
                    <li>
                      <strong>Consent:</strong> Share with your explicit
                      permission
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Data Retention:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Account data: Until you delete your account</li>
                    <li>Transaction data: 7 years (regulatory requirement)</li>
                    <li>Log data: 90 days for security purposes</li>
                    <li>Marketing data: Until you unsubscribe</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "security" && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Measures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Security Practices:</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>End-to-end encryption for all data transmission</li>
                    <li>Secure servers with industry-standard protection</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Multi-factor authentication options</li>
                    <li>Real-time fraud detection systems</li>
                    <li>Secure wallet integration (no private key access)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    Your Security Responsibilities:
                  </h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-600">
                    <li>Keep your login credentials secure</li>
                    <li>Enable two-factor authentication</li>
                    <li>Never share your private keys or seed phrases</li>
                    <li>Use strong, unique passwords</li>
                    <li>Keep your device and apps updated</li>
                    <li>Report suspicious activity immediately</li>
                  </ul>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-green-800 dark:text-green-200 text-sm">
                    <strong>Security Tip:</strong> We never ask for your private
                    keys, seed phrases, or wallet passwords. Anyone claiming to
                    be from Biaz asking for these is a scammer.
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
