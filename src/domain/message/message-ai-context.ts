/**
 * Message AI Context - Purely Additive Metadata
 * 
 * Zero changes to existing message flow.
 * This is optional metadata that can be attached to messages.
 * 
 * @version 1.0.1
 */

export interface DetectedSKU {
  skuId: string;
  skuName: string;
  highlightStart?: number; // Position in message text
  highlightEnd?: number;
}

export interface DetectedPO {
  poNumber: string;
  poValue: number;
  highlightStart?: number;
  highlightEnd?: number;
}

export interface MessageAIContext {
  detectedSKUs?: DetectedSKU[];
  detectedPO?: DetectedPO;
  insightType?: "sku" | "po" | "both";
}

// Extended message type (backward compatible)
export interface MessageWithAI {
  aiContext?: MessageAIContext;
}

// SKU Price Trend Data (Static Mock)
export interface SKUPriceTrend {
  skuId: string;
  skuName: string;
  priceHistory: {
    date: string;
    price: number;
  }[];
}

// Credit Check Data (Static Mock)
export interface CreditCheckResult {
  poNumber: string;
  poValue: number;
  availableCredit: number;
  requiredCredit: number;
  shortfall: number;
  status: "sufficient" | "insufficient" | "blocked";
  blockReason?: string;
}

// Mock SKU Database
export const MOCK_SKU_DATABASE: Record<string, SKUPriceTrend> = {
  "sku_tmt_500d": {
    skuId: "sku_tmt_500d",
    skuName: "TMT 500D",
    priceHistory: [
      { date: "12 Jan", price: 58200 },
      { date: "13 Jan", price: 58450 },
      { date: "14 Jan", price: 58300 },
    ],
  },
  "sku_steel_pipe_4": {
    skuId: "sku_steel_pipe_4",
    skuName: "Steel Pipe 4 inch",
    priceHistory: [
      { date: "12 Jan", price: 12500 },
      { date: "13 Jan", price: 12450 },
      { date: "14 Jan", price: 12600 },
    ],
  },
  "sku_cement_opc_53": {
    skuId: "sku_cement_opc_53",
    skuName: "Cement OPC 53",
    priceHistory: [
      { date: "12 Jan", price: 385 },
      { date: "13 Jan", price: 390 },
      { date: "14 Jan", price: 388 },
    ],
  },
};

// Mock Credit Data (keyed by PO number)
export const MOCK_CREDIT_DATABASE: Record<string, CreditCheckResult> = {
  "PO/2024/001": {
    poNumber: "PO/2024/001",
    poValue: 2800000,
    availableCredit: 2200000,
    requiredCredit: 2800000,
    shortfall: 600000,
    status: "insufficient",
  },
  "PO/2024/002": {
    poNumber: "PO/2024/002",
    poValue: 1500000,
    availableCredit: 2200000,
    requiredCredit: 1500000,
    shortfall: 0,
    status: "sufficient",
  },
  "PO/2024/003": {
    poNumber: "PO/2024/003",
    poValue: 3200000,
    availableCredit: 0,
    requiredCredit: 3200000,
    shortfall: 3200000,
    status: "blocked",
    blockReason: "Limit blocked due to MDD",
  },
};

/**
 * Passive Entity Detection - Runs after render
 * 
 * Detects SKUs and POs in message text without modifying the message.
 */
export function detectEntitiesInMessage(messageText: string): MessageAIContext | null {
  console.log('[AI Detection] Processing message:', messageText.substring(0, 100));
  
  const aiContext: MessageAIContext = {};
  
  // Detect SKUs
  const detectedSKUs: DetectedSKU[] = [];
  
  // Check for each known SKU
  Object.values(MOCK_SKU_DATABASE).forEach((sku) => {
    const skuNameLower = sku.skuName.toLowerCase();
    const messageLower = messageText.toLowerCase();
    
    const index = messageLower.indexOf(skuNameLower);
    if (index !== -1) {
      console.log('[AI Detection] Found SKU:', sku.skuName, 'at position', index);
      detectedSKUs.push({
        skuId: sku.skuId,
        skuName: sku.skuName,
        highlightStart: index,
        highlightEnd: index + sku.skuName.length,
      });
    }
  });
  
  // Pattern-based SKU detection (SKU: or Material:)
  const skuPattern = /(?:SKU|Material):\s*([A-Za-z0-9\s]+(?:inch)?)/gi;
  let match;
  while ((match = skuPattern.exec(messageText)) !== null) {
    const skuName = match[1].trim();
    
    // Check if this matches a known SKU
    const knownSKU = Object.values(MOCK_SKU_DATABASE).find(
      sku => sku.skuName.toLowerCase() === skuName.toLowerCase()
    );
    
    if (knownSKU && !detectedSKUs.some(s => s.skuId === knownSKU.skuId)) {
      console.log('[AI Detection] Found SKU:', knownSKU.skuName, 'at position', match.index);
      detectedSKUs.push({
        skuId: knownSKU.skuId,
        skuName: knownSKU.skuName,
        highlightStart: match.index,
        highlightEnd: match.index + match[0].length,
      });
    }
  }
  
  if (detectedSKUs.length > 0) {
    aiContext.detectedSKUs = detectedSKUs;
  }
  
  // Detect PO
  const poPattern = /(?:PO|Purchase\s+Order)[:\s]*([A-Z0-9\/]+)/gi;
  const poMatch = poPattern.exec(messageText);
  
  if (poMatch) {
    const poNumber = poMatch[1].trim();
    
    // Check if we have credit data for this PO
    const creditData = MOCK_CREDIT_DATABASE[poNumber];
    
    if (creditData) {
      aiContext.detectedPO = {
        poNumber,
        poValue: creditData.poValue,
        highlightStart: poMatch.index,
        highlightEnd: poMatch.index + poMatch[0].length,
      };
    } else {
      // Generic PO detection without credit data
      // Extract value if present
      const valuePattern = /₹[\d,]+/;
      const valueMatch = messageText.match(valuePattern);
      
      if (valueMatch) {
        const valueStr = valueMatch[0].replace(/₹|,/g, '');
        const poValue = parseInt(valueStr, 10);
        
        aiContext.detectedPO = {
          poNumber,
          poValue,
          highlightStart: poMatch.index,
          highlightEnd: poMatch.index + poMatch[0].length,
        };
      }
    }
  }
  
  // Set insight type
  if (aiContext.detectedSKUs && aiContext.detectedPO) {
    aiContext.insightType = "both";
  } else if (aiContext.detectedSKUs) {
    aiContext.insightType = "sku";
  } else if (aiContext.detectedPO) {
    aiContext.insightType = "po";
  }
  
  // Return null if nothing detected
  if (!aiContext.insightType) {
    console.log('[AI Detection] No entities detected');
    return null;
  }
  
  console.log('[AI Detection] Detected entities:', {
    type: aiContext.insightType,
    skus: aiContext.detectedSKUs?.length || 0,
    po: aiContext.detectedPO?.poNumber || 'none'
  });
  
  return aiContext;
}

/**
 * Get SKU price trend data
 */
export function getSKUPriceTrend(skuId: string): SKUPriceTrend | null {
  return MOCK_SKU_DATABASE[skuId] || null;
}

/**
 * Get credit check result
 */
export function getCreditCheckResult(poNumber: string): CreditCheckResult | null {
  return MOCK_CREDIT_DATABASE[poNumber] || null;
}