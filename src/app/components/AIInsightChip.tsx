/**
 * AI Insight Chip Component
 * 
 * Collapsible chip that appears below messages with detected entities.
 */

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import {
  MessageAIContext,
  getSKUPriceTrend,
  getCreditCheckResult,
} from "@/domain/message/message-ai-context";

interface AIInsightChipProps {
  aiContext: MessageAIContext;
  currentRole: string;
}

export function AIInsightChip({ aiContext, currentRole }: AIInsightChipProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Determine what insights to show based on role
  const showSKUInsights = aiContext.detectedSKUs && aiContext.detectedSKUs.length > 0;
  const showCreditInsights = aiContext.detectedPO && ["BDM", "CM", "CX"].includes(currentRole);
  
  // Don't render if no insights to show
  if (!showSKUInsights && !showCreditInsights) {
    return null;
  }
  
  // Determine chip label
  let chipLabel = "";
  if (showSKUInsights && showCreditInsights) {
    chipLabel = "Price trend & Credit check";
  } else if (showSKUInsights) {
    chipLabel = "Price trend available";
  } else if (showCreditInsights) {
    chipLabel = "Credit check";
  }
  
  return (
    <div className="mt-1.5 max-w-fit">
      {/* Chip Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-medium transition-colors"
      >
        <Sparkles className="w-3 h-3" />
        <span>AI Insight</span>
        <span className="text-blue-600">·</span>
        <span className="text-blue-600">{chipLabel}</span>
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 ml-0.5" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-0.5" />
        )}
      </button>
      
      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mt-2 p-4 bg-white border border-blue-100 rounded-lg shadow-sm">
          {/* SKU Insights */}
          {showSKUInsights && aiContext.detectedSKUs && (
            <div className="space-y-4">
              {aiContext.detectedSKUs.map((sku, index) => {
                const priceTrend = getSKUPriceTrend(sku.skuId);
                
                if (!priceTrend) return null;
                
                return (
                  <div key={sku.skuId}>
                    {index > 0 && <div className="border-t border-gray-200 pt-4" />}
                    
                    <div className="space-y-3">
                      {/* Price table with columns */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 font-medium text-gray-700">SKU</th>
                              <th className="text-right py-2 px-3 font-medium text-gray-700">N day Price</th>
                              <th className="text-right py-2 px-3 font-medium text-gray-700">N-1 day Price</th>
                              <th className="text-right py-2 px-3 font-medium text-gray-700">N-2 day Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="py-2 px-3 text-gray-900 font-medium">{priceTrend.skuName}</td>
                              {priceTrend.priceHistory.slice(0, 3).map((entry, idx) => (
                                <td key={idx} className="py-2 px-3 text-right text-gray-900">
                                  ₹{entry.price.toLocaleString("en-IN")}
                                </td>
                              ))}
                              {/* Fill empty cells if less than 3 price points */}
                              {Array.from({ length: Math.max(0, 3 - priceTrend.priceHistory.length) }).map((_, idx) => (
                                <td key={`empty-${idx}`} className="py-2 px-3 text-right text-gray-400">
                                  —
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Separator if both insights present */}
          {showSKUInsights && showCreditInsights && (
            <div className="border-t border-gray-200 my-4" />
          )}
          
          {/* Credit Insights */}
          {showCreditInsights && aiContext.detectedPO && (
            <div className="space-y-3">
              <div className="font-medium text-sm text-gray-900">
                Credit Check
              </div>
              
              {(() => {
                const creditResult = getCreditCheckResult(aiContext.detectedPO.poNumber);
                
                if (!creditResult) {
                  return (
                    <div className="text-sm text-gray-600">
                      No credit data available for PO {aiContext.detectedPO.poNumber}
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">PO Value</span>
                      <span className="font-medium text-gray-900">
                        ₹{creditResult.poValue.toLocaleString("en-IN")}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available Credit</span>
                      <span className="font-medium text-gray-900">
                        ₹{creditResult.availableCredit.toLocaleString("en-IN")}
                      </span>
                    </div>
                    
                    {creditResult.shortfall > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Shortfall</span>
                        <span className="font-medium text-red-600">
                          ₹{creditResult.shortfall.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                    
                    {/* Status Message */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      {creditResult.status === "sufficient" && (
                        <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                          ✓ Sufficient credit available
                        </div>
                      )}
                      
                      {creditResult.status === "insufficient" && (
                        <div className="text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded">
                          ⚠ Short credit by ₹{creditResult.shortfall.toLocaleString("en-IN")}
                        </div>
                      )}
                      
                      {creditResult.status === "blocked" && (
                        <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded space-y-1">
                          <div className="font-medium">✕ Credit blocked</div>
                          {creditResult.blockReason && (
                            <div className="text-xs">Reason: {creditResult.blockReason}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}