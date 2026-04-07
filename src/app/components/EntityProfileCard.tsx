/**
 * EntityProfileCard Component
 * 
 * Unified profile card system supporting both buyers and sellers.
 * Features role-based views, quick signals, AI insights, and performance metrics.
 */

import * as React from "react";
import { format } from "date-fns";
import {
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  MessageSquare,
  ChevronRight,
  Sparkles,
  ShoppingCart,
  Mail,
  Phone,
  TrendingDown,
} from "lucide-react";
import type { ProfileData, ProfileCardPage, Role } from "@/domain/persona/persona.profile-data";
import { getAvailablePages } from "@/domain/persona/persona.profile-data";

const __DEV_LOG__ = false;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

export interface EntityProfileCardProps {
  profileData: ProfileData;
  viewerRole: Role;
  onNavigate?: (page: ProfileCardPage) => void;
}

/**
 * Shared section header component
 */
function SectionHeader({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{children}</h3>;
}

/**
 * EntityProfileCardHeader Component - Displays name, role, location
 */
function EntityProfileCardHeader({ profileData }: { profileData: ProfileData }) {
  const { displayName, overview, entityType, avatarUrl } = profileData;

  // Determine status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "credit_blocked":
        return "bg-red-100 text-red-700";
      case "new_buyer":
        return "bg-blue-100 text-blue-700";
      case "under_review":
        return "bg-orange-100 text-orange-700";
      case "blocked":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-blue-50 to-white border-b border-gray-200">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="size-12 rounded-full object-cover" />
          ) : (
            displayName?.charAt(0).toUpperCase() || "?"
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Display Name */}
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {displayName || "Unknown"}
          </h2>
          
          {/* Company / Legal Name */}
          {overview?.legalName && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
              <Building2 className="size-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{overview.legalName}</span>
            </div>
          )}
          
          {/* Location */}
          {overview?.primaryLocation && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
              <MapPin className="size-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{overview.primaryLocation}</span>
            </div>
          )}
          
          {/* Status and Entity Type */}
          <div className="flex items-center gap-2 mt-2">
            {overview?.status && (
              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded capitalize ${getStatusColor(overview.status)}`}>
                {overview.status.replace(/_/g, ' ')}
              </span>
            )}
            {entityType && (
              <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded capitalize">
                {entityType}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProfileCardNav Component - Tab navigation
 */
interface ProfileCardNavProps {
  availablePages: ProfileCardPage[];
  activePage: ProfileCardPage;
  onPageChange: (page: ProfileCardPage) => void;
  entityType: "buyer" | "seller";
}

function ProfileCardNav({ availablePages, activePage, onPageChange, entityType }: ProfileCardNavProps) {
  const getPageLabel = (page: ProfileCardPage): string => {
    // Seller-specific labels
    if (entityType === "seller") {
      if (page === "activity") return "Performance";
      if (page === "risk") return "History";
    }
    
    // Buyer labels - renamed for BDMs
    const labels: Record<ProfileCardPage, string> = {
      overview: "Overview",
      credit: "Credit",
      activity: "Insights",
      risk: "Risk",
    };
    
    return labels[page] || page;
  };

  return (
    <div className="flex border-b border-gray-200 bg-white px-4">
      {availablePages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex-1 px-3 py-3 text-sm font-medium transition-colors relative ${
            activePage === page
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {getPageLabel(page)}
          {activePage === page && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
          )}
        </button>
      ))}
    </div>
  );
}

/**
 * CreditPage Component - Credit information
 */
function CreditPage({ profileData }: { profileData: ProfileData }) {
  const { credit } = profileData;

  if (!credit) {
    return <div className="p-4 text-sm text-gray-500">Credit information not available</div>;
  }

  const utilizationPercent = credit.utilizationPercent;

  return (
    <div className="p-4 space-y-6">
      {/* Credit Overview */}
      <div>
        <SectionHeader>Credit Limit</SectionHeader>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Total Limit</div>
            <div className="text-2xl font-semibold text-gray-900">
              ₹{(credit.creditLimit / 100000).toFixed(1)}L
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Available</div>
            <div className="text-2xl font-semibold text-green-600">
              ₹{(credit.creditAvailable / 100000).toFixed(1)}L
            </div>
          </div>
        </div>

        {/* Credit Utilization Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">Utilization</span>
            <span className="font-medium text-gray-900">{utilizationPercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                utilizationPercent > 80
                  ? "bg-red-500"
                  : utilizationPercent > 60
                  ? "bg-orange-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${utilizationPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Payment Terms */}
      <div>
        <SectionHeader>Payment Terms</SectionHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment Terms</span>
            <span className="font-medium text-gray-900">{credit.paymentTerms}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Avg. Payment Days</span>
            <span className="font-medium text-gray-900">{credit.avgPaymentDays} days</span>
          </div>
          {credit.creditUsed > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Credit Used</span>
              <span className="font-medium text-orange-600">
                ₹{(credit.creditUsed / 100000).toFixed(1)}L
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Credit Instruments */}
      {credit.instruments && credit.instruments.length > 0 && (
        <div>
          <SectionHeader>Credit Instruments</SectionHeader>
          <div className="space-y-2">
            {credit.instruments.map((instrument) => (
              <div key={instrument.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 capitalize">
                    {instrument.type.replace(/_/g, ' ')}
                  </div>
                  {instrument.provider && (
                    <div className="text-xs text-gray-500">{instrument.provider}</div>
                  )}
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  ₹{(instrument.amount / 100000).toFixed(1)}L
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversion Signal */}
      {credit.conversionSignal && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="size-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-900">{credit.conversionSignal}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * RiskPage Component - Risk assessment and compliance
 */
function RiskPage({ profileData }: { profileData: ProfileData }) {
  const { risk } = profileData;

  if (!risk) {
    return <div className="p-4 text-sm text-gray-500">Risk assessment not available</div>;
  }

  const getRiskColor = (level?: string) => {
    if (!level) return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
    
    switch (level.toLowerCase()) {
      case "low":
        return { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" };
      case "medium":
        return { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" };
      case "high":
        return { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "info":
        return { bg: "bg-blue-50", text: "text-blue-700", icon: "text-blue-600" };
      case "warning":
        return { bg: "bg-orange-50", text: "text-orange-700", icon: "text-orange-600" };
      case "critical":
        return { bg: "bg-red-50", text: "text-red-700", icon: "text-red-600" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-700", icon: "text-gray-600" };
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Overall Risk Scores */}
      <div>
        <SectionHeader>Risk Assessment</SectionHeader>
        <div className="space-y-3">
          {risk.paymentRisk && (
            <div className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="text-sm text-gray-700">Payment Risk</span>
              <span className={`text-sm font-semibold capitalize ${getRiskColor(risk.paymentRisk).text}`}>
                {risk.paymentRisk}
              </span>
            </div>
          )}
          {risk.deliveryRisk && (
            <div className="flex items-center justify-between p-2 rounded bg-gray-50">
              <span className="text-sm text-gray-700">Delivery Risk</span>
              <span className={`text-sm font-semibold capitalize ${getRiskColor(risk.deliveryRisk).text}`}>
                {risk.deliveryRisk}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Risk Flags */}
      {risk.flags && risk.flags.length > 0 && (
        <div>
          <SectionHeader>Risk Flags</SectionHeader>
          <div className="space-y-2">
            {risk.flags.map((flag) => {
              const colors = getSeverityColor(flag.severity);
              return (
                <div key={flag.id} className={`p-3 rounded-lg border ${colors.bg}`}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`size-4 ${colors.icon} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{flag.label}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text} capitalize`}>
                          {flag.severity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">{flag.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Dispute History */}
      {risk.disputeHistory !== undefined && (
        <div>
          <SectionHeader>Dispute History</SectionHeader>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-700">Total Disputes</span>
            <span className={`text-lg font-semibold ${
              risk.disputeHistory === 0 ? "text-green-600" :
              risk.disputeHistory <= 2 ? "text-orange-600" :
              "text-red-600"
            }`}>
              {risk.disputeHistory}
            </span>
          </div>
        </div>
      )}

      {/* Internal Notes */}
      {risk.internalNotes && risk.internalNotes.length > 0 && (
        <div>
          <SectionHeader>Internal Notes</SectionHeader>
          <div className="space-y-2">
            {risk.internalNotes.map((note, index) => (
              <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-sm text-gray-900">{note}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * BuyerInsightsPage Component - Quick Signals, AI Insights, and Metrics
 */
function BuyerInsightsPage({ profileData }: { profileData: ProfileData }) {
  const { quickSignals, aiInsights, activity } = profileData;

  return (
    <div className="p-4 space-y-6">
      {/* Quick Signals */}
      {quickSignals && (
        <div>
          <SectionHeader>Quick Signals</SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <CreditCard className="size-3.5" />
                <span>Open Credit</span>
              </div>
              <div className="text-xl font-semibold text-green-600">
                ₹{(quickSignals.openCredit / 100000).toFixed(1)}L
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="size-3.5" />
                <span>Payment Cycle</span>
              </div>
              <div className="text-xl font-semibold text-gray-900">
                {quickSignals.typicalPaymentCycle}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <ShoppingCart className="size-3.5" />
                <span>Buying Frequency</span>
              </div>
              <div className={`text-xl font-semibold capitalize ${
                quickSignals.orderFrequency === 'high' ? 'text-green-600' :
                quickSignals.orderFrequency === 'medium' ? 'text-blue-600' :
                'text-orange-600'
              }`}>
                {quickSignals.orderFrequency}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <AlertTriangle className="size-3.5" />
                <span>Risk</span>
              </div>
              <div className={`text-xl font-semibold capitalize ${
                quickSignals.riskFlag === 'low' ? 'text-green-600' :
                quickSignals.riskFlag === 'medium' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {quickSignals.riskFlag}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Metrics */}
      <div>
        <SectionHeader>Conversion Metrics</SectionHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Conversion Rate</div>
            <div className="text-2xl font-semibold text-green-600">{activity.conversionRate}%</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Avg. Time to PO</div>
            <div className="text-2xl font-semibold text-blue-600">{activity.avgTimeToConversion}</div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      {aiInsights && aiInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-purple-600" />
            <SectionHeader>AI Insights</SectionHeader>
          </div>
          
          <div className="space-y-3">
            {aiInsights.map((insight) => {
              const colors = {
                credit: { bg: "bg-blue-50", text: "text-blue-700" },
                conversion: { bg: "bg-green-50", text: "text-green-700" },
                negotiation: { bg: "bg-purple-50", text: "text-purple-700" },
                followup: { bg: "bg-orange-50", text: "text-orange-700" },
              }[insight.type] || { bg: "bg-gray-50", text: "text-gray-700" };

              return (
                <div key={insight.id} className="border-l-2 border-blue-500 pl-3 py-1">
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text} capitalize`}>
                      {insight.type === "followup" ? "Follow-up" : insight.type}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {insight.title}
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {insight.message}
                  </div>
                  {insight.confidenceLevel && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 w-4 rounded-full ${
                              (insight.confidenceLevel === "high" && i <= 3) ||
                              (insight.confidenceLevel === "medium" && i <= 2) ||
                              (insight.confidenceLevel === "low" && i <= 1)
                                ? "bg-blue-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 capitalize">
                        {insight.confidenceLevel} confidence
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Response Metrics */}
      <div>
        <SectionHeader>Response Metrics</SectionHeader>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Avg. Response Time</span>
            <span className="font-medium text-gray-900">{activity.avgResponseTime}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Response Rate</span>
            <span className={`font-medium ${activity.responseRate >= 85 ? "text-green-600" : "text-orange-600"}`}>
              {activity.responseRate}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Engagement Score</span>
            <span className={`font-medium ${
              activity.engagementScore >= 85 ? "text-green-600" : 
              activity.engagementScore >= 70 ? "text-blue-600" : 
              "text-orange-600"
            }`}>
              {activity.engagementScore}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BuyerOverviewPage Component - Business data and recent activity
 */
function BuyerOverviewPage({ profileData }: { profileData: ProfileData }) {
  const { businessOverview, activity } = profileData;

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "enquiry_created":
        return <ChevronRight className="size-4" />;
      case "quote_shared":
        return <DollarSign className="size-4" />;
      case "response_received":
        return <MessageSquare className="size-4" />;
      case "po_received":
        return <CheckCircle2 className="size-4" />;
      default:
        return <Calendar className="size-4" />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Recent Activity */}
      <div>
        <SectionHeader>Recent Activity ({activity.recentMilestones.length})</SectionHeader>
        <div className="space-y-3">
          {activity.recentMilestones.map((milestone) => (
            <div key={milestone.id} className="border-l-2 border-gray-300 pl-3">
              <div className="flex items-start gap-2">
                <div className="text-blue-600 flex-shrink-0 mt-0.5">
                  {getMilestoneIcon(milestone.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{milestone.description}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    {milestone.enquiryId && (
                      <>
                        <span className="font-medium">{milestone.enquiryId}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{format(milestone.timestamp, "MMM d, h:mm a")}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Categories */}
      {businessOverview && (
        <>
          <div>
            <SectionHeader>Primary Categories</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {businessOverview.primaryCategories.map((category) => (
                <span
                  key={category}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader>Business Metrics</SectionHeader>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last Order</span>
                <span className="font-medium text-gray-900">
                  {format(businessOverview.lastOrderDate, "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Avg Order Value</span>
                <span className="font-medium text-gray-900">
                  ₹{(businessOverview.avgOrderValue.min / 100000).toFixed(0)}-
                  {(businessOverview.avgOrderValue.max / 100000).toFixed(0)}L
                </span>
              </div>
            </div>
          </div>

          <div>
            <SectionHeader>Top Delivery Locations</SectionHeader>
            <div className="space-y-2">
              {businessOverview.topDeliveryLocations.map((location) => (
                <div key={location} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="size-1.5 rounded-full bg-blue-500" />
                  <span>{location}</span>
                </div>
              ))}
            </div>
          </div>

          {businessOverview.preferredSellers.length > 0 && (
            <div>
              <SectionHeader>Preferred Sellers</SectionHeader>
              <div className="space-y-2">
                {businessOverview.preferredSellers.map((seller) => (
                  <div key={seller} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="size-4 text-green-600" />
                    <span>{seller}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Contact Information */}
      {profileData.contact && (
        <div>
          <SectionHeader>Contact Information</SectionHeader>
          <div className="space-y-2">
            {profileData.contact.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="size-4 text-gray-400" />
                <span className="truncate">{profileData.contact.email}</span>
              </div>
            )}
            {profileData.contact.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="size-4 text-gray-400" />
                <span>{profileData.contact.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * SellerOverviewPage Component - Seller business information
 */
function SellerOverviewPage({ profileData }: { profileData: ProfileData }) {
  const { sellerQuickSignals, sellerAIInsights, sellerOverview } = profileData;

  return (
    <div className="p-4 space-y-6">
      {/* Quick Signals */}
      {sellerQuickSignals && (
        <div>
          <SectionHeader>Quick Signals</SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="size-3.5" />
                <span>Quote Speed</span>
              </div>
              <div className="text-xl font-semibold text-blue-600">
                {sellerQuickSignals.quoteSpeedHours}h
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <CheckCircle2 className="size-3.5" />
                <span>Delivery</span>
              </div>
              <div className="text-xl font-semibold text-green-600">
                {sellerQuickSignals.deliveryReliabilityPercent}%
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <TrendingDown className="size-3.5" />
                <span>Price</span>
              </div>
              <div className={`text-xl font-semibold capitalize ${
                sellerQuickSignals.priceCompetitiveness === 'competitive' ? 'text-green-600' :
                sellerQuickSignals.priceCompetitiveness === 'budget' ? 'text-blue-600' :
                'text-orange-600'
              }`}>
                {sellerQuickSignals.priceCompetitiveness}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <AlertTriangle className="size-3.5" />
                <span>Risk</span>
              </div>
              <div className={`text-xl font-semibold capitalize ${
                sellerQuickSignals.riskLevel === 'low' ? 'text-green-600' :
                sellerQuickSignals.riskLevel === 'medium' ? 'text-orange-600' :
                'text-red-600'
              }`}>
                {sellerQuickSignals.riskLevel}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights for Routing */}
      {sellerAIInsights && sellerAIInsights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-purple-600" />
            <SectionHeader>AI Routing Insights</SectionHeader>
          </div>
          
          <div className="space-y-3">
            {sellerAIInsights.map((insight) => {
              const colors = {
                routing: { bg: "bg-purple-50", text: "text-purple-700" },
                pricing: { bg: "bg-green-50", text: "text-green-700" },
                risk: { bg: "bg-red-50", text: "text-red-700" },
              }[insight.type] || { bg: "bg-gray-50", text: "text-gray-700" };

              return (
                <div key={insight.id} className="border-l-2 border-purple-500 pl-3 py-1">
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text} capitalize`}>
                      {insight.type}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {insight.title}
                  </div>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {insight.message}
                  </div>
                  {insight.confidenceLevel && (
                    <div className="mt-2 flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={`h-1 w-4 rounded-full ${
                              (insight.confidenceLevel === "high" && i <= 3) ||
                              (insight.confidenceLevel === "medium" && i <= 2) ||
                              (insight.confidenceLevel === "low" && i <= 1)
                                ? "bg-purple-500"
                                : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 capitalize">
                        {insight.confidenceLevel} confidence
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Business Overview */}
      {sellerOverview && (
        <>
          <div>
            <SectionHeader>Specializations</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {sellerOverview.primaryCategories.map((category) => (
                <span
                  key={category}
                  className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded text-sm"
                >
                  {category}
                </span>
              ))}
            </div>
          </div>

          <div>
            <SectionHeader>Service Locations</SectionHeader>
            <div className="space-y-2">
              {sellerOverview.preferredDeliveryRegions.map((location) => (
                <div key={location} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="size-1.5 rounded-full bg-purple-500" />
                  <span>{location}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Contact Information */}
      {profileData.contact && (
        <div>
          <SectionHeader>Contact Information</SectionHeader>
          <div className="space-y-2">
            {profileData.contact.email && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail className="size-4 text-gray-400" />
                <span className="truncate">{profileData.contact.email}</span>
              </div>
            )}
            {profileData.contact.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="size-4 text-gray-400" />
                <span>{profileData.contact.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ActivityPage Component - Handles both buyer and seller
 */
function ActivityPage({ profileData }: { profileData: ProfileData }) {
  const { activity } = profileData;
  const isSeller = profileData.entityType === "seller";

  // Buyer Insights Page
  if (!isSeller) {
    return <BuyerInsightsPage profileData={profileData} />;
  }

  // Seller Performance Page
  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case "enquiry_created":
        return <ChevronRight className="size-4" />;
      case "quote_shared":
        return <DollarSign className="size-4" />;
      case "response_received":
        return <MessageSquare className="size-4" />;
      case "po_received":
        return <CheckCircle2 className="size-4" />;
      default:
        return <Calendar className="size-4" />;
    }
  };

  if (profileData.sellerPerformance) {
    const { sellerPerformance } = profileData;

    return (
      <div className="p-4 space-y-6">
        {/* Conversion Metrics */}
        <div>
          <SectionHeader>Conversion Metrics</SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Quote Acceptance</div>
              <div className="text-2xl font-semibold text-green-600">
                {sellerPerformance.quoteAcceptanceRate}%
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-gray-500">Order Conversion</div>
              <div className="text-2xl font-semibold text-blue-600">
                {sellerPerformance.orderConversionRate}%
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch Performance */}
        <div>
          <SectionHeader>Dispatch Performance</SectionHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. Dispatch Time</span>
              <span className="font-medium text-gray-900">{sellerPerformance.avgDispatchDays} days</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Engagement Score</span>
              <span className={`font-medium ${
                activity.engagementScore >= 85 ? "text-green-600" : 
                activity.engagementScore >= 70 ? "text-blue-600" : 
                "text-orange-600"
              }`}>
                {activity.engagementScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Response Metrics */}
        <div>
          <SectionHeader>Response Metrics</SectionHeader>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Avg. Response Time</span>
              <span className="font-medium text-gray-900">{activity.avgResponseTime}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Response Rate</span>
              <span className={`font-medium ${activity.responseRate >= 85 ? "text-green-600" : "text-orange-600"}`}>
                {activity.responseRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <SectionHeader>Recent Activity ({activity.recentMilestones.length})</SectionHeader>
          <div className="space-y-3">
            {activity.recentMilestones.map((milestone) => (
              <div key={milestone.id} className="border-l-2 border-gray-300 pl-3">
                <div className="flex items-start gap-2">
                  <div className="text-purple-600 flex-shrink-0 mt-0.5">
                    {getMilestoneIcon(milestone.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{milestone.description}</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      {milestone.enquiryId && (
                        <>
                          <span className="font-medium">{milestone.enquiryId}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{format(milestone.timestamp, "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <div className="p-4 text-sm text-gray-500">Performance data not available</div>;
}

/**
 * OverviewPage Component - Routes to buyer or seller overview
 */
function OverviewPage({ profileData }: { profileData: ProfileData }) {
  if (profileData.entityType === "seller") {
    return <SellerOverviewPage profileData={profileData} />;
  }
  return <BuyerOverviewPage profileData={profileData} />;
}

/**
 * EntityProfileCard Component
 */
export function EntityProfileCard({ profileData, viewerRole, onNavigate }: EntityProfileCardProps) {
  // Default to first available page
  const availablePages = React.useMemo(
    () => getAvailablePages(profileData.entityType, viewerRole),
    [profileData.entityType, viewerRole]
  );
  
  const [activePage, setActivePage] = React.useState<ProfileCardPage>(availablePages[0] || "overview");
  
  const handlePageChange = (page: ProfileCardPage) => {
    setActivePage(page);
    onNavigate?.(page);
  };
  
  // Render active page content
  const renderPageContent = () => {
    try {
      switch (activePage) {
        case "overview":
          return <OverviewPage profileData={profileData} />;
        case "credit":
          return <CreditPage profileData={profileData} />;
        case "activity":
          return <ActivityPage profileData={profileData} />;
        case "risk":
          return <RiskPage profileData={profileData} />;
        default:
          return <OverviewPage profileData={profileData} />;
      }
    } catch (error) {
      devError('[EntityProfileCard] Error rendering page:', error);
      return (
        <div className="p-4 text-sm text-red-600">
          Failed to load profile data
        </div>
      );
    }
  };
  
  return (
    <div className="w-[460px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
      <EntityProfileCardHeader profileData={profileData} />
      
      <ProfileCardNav 
        availablePages={availablePages}
        activePage={activePage}
        onPageChange={handlePageChange}
        entityType={profileData.entityType}
      />
      
      <div className="max-h-[500px] overflow-y-auto">
        {renderPageContent()}
      </div>
    </div>
  );
}

// Export both names for backwards compatibility
export { EntityProfileCard as ProfileHoverCard };
export type { EntityProfileCardProps as ProfileHoverCardProps };