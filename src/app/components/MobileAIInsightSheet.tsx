/**
 * MobileAIInsightSheet Component
 * 
 * Bottom sheet for displaying AI insights on mobile.
 * Used when AIInsightChip is expanded on mobile.
 */

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { ProfileBottomSheet } from './ProfileBottomSheet';
import { getSKUPriceTrend, getCreditCheckResult } from '@/domain/message/message-ai-context';

interface MobileAIInsightSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skuIds?: string[];
  poNumber?: string;
}

/**
 * MobileAIInsightSheet - Display AI insights in bottom sheet
 * 
 * Shows:
 * - SKU price trends (table format)
 * - Credit check results
 */
export function MobileAIInsightSheet({
  open,
  onOpenChange,
  skuIds,
  poNumber,
}: MobileAIInsightSheetProps) {
  const showSKUInsights = skuIds && skuIds.length > 0;
  const showCreditInsights = !!poNumber;
  
  return (
    <ProfileBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="AI Insights"
    >
      <div className="p-4 space-y-6">
        {/* SKU Insights */}
        {showSKUInsights && skuIds && (
          <div className="space-y-4">
            {skuIds.map((skuId, index) => {
              const priceTrend = getSKUPriceTrend(skuId);
              
              if (!priceTrend) return null;
              
              return (
                <div key={skuId}>
                  {index > 0 && <div className="border-t border-gray-200 pt-4" />}
                  
                  <div className="space-y-3">
                    {/* Price table with columns */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-3 font-medium text-gray-700">SKU</th>
                            <th className="text-right py-3 px-3 font-medium text-gray-700">N day</th>
                            <th className="text-right py-3 px-3 font-medium text-gray-700">N-1 day</th>
                            <th className="text-right py-3 px-3 font-medium text-gray-700">N-2 day</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="py-3 px-3 text-gray-900 font-medium">{priceTrend.skuName}</td>
                            {priceTrend.priceHistory.slice(0, 3).map((entry, idx) => (
                              <td key={idx} className="py-3 px-3 text-right text-gray-900">
                                ₹{entry.price.toLocaleString("en-IN")}
                              </td>
                            ))}
                            {/* Fill empty cells if less than 3 price points */}
                            {Array.from({ length: Math.max(0, 3 - priceTrend.priceHistory.length) }).map((_, idx) => (
                              <td key={`empty-${idx}`} className="py-3 px-3 text-right text-gray-400">
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
          <div className="border-t border-gray-200" />
        )}
        
        {/* Credit Insights */}
        {showCreditInsights && poNumber && (
          <div className="space-y-3">
            <div className="font-medium text-sm text-gray-900">
              Credit Check
            </div>
            
            {(() => {
              const creditResult = getCreditCheckResult(poNumber);
              
              if (!creditResult) {
                return (
                  <div className="text-sm text-gray-600">
                    No credit data available for PO {poNumber}
                  </div>
                );
              }
              
              return (
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">PO Value</span>
                    <span className="text-base font-medium text-gray-900">
                      ₹{creditResult.poValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600">Available Credit</span>
                    <span className="text-base font-medium text-gray-900">
                      ₹{creditResult.availableCredit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  
                  {creditResult.shortfall > 0 && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Shortfall</span>
                      <span className="text-base font-medium text-red-600">
                        ₹{creditResult.shortfall.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  
                  {/* Status Message */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {creditResult.status === "sufficient" && (
                      <div className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                        ✓ Sufficient credit available
                      </div>
                    )}
                    
                    {creditResult.status === "insufficient" && (
                      <div className="text-sm text-orange-700 bg-orange-50 px-4 py-3 rounded-lg">
                        ⚠ Short credit by ₹{creditResult.shortfall.toLocaleString("en-IN")}
                      </div>
                    )}
                    
                    {creditResult.status === "blocked" && (
                      <div className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg space-y-1">
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
    </ProfileBottomSheet>
  );
}
