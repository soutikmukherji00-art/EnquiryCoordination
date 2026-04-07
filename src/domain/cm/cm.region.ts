/**
 * Domain: Category Manager (CM) Regional Assignments
 * 
 * Maps CMs to geographical regions and cities to regions.
 */

export type Region = "North" | "South" | "East" | "West";

/**
 * CM Regional Assignments
 */
export const CM_REGIONS: Record<string, Region> = {
  "p_cm_north": "North",  // Priya Sharma - Steel Specialist
  "p_cm_south": "South",  // Amit Patel - Polymer Specialist
  "p_cm_east": "East",    // Rajesh Kumar - Bitumen Specialist
  "p_cm_west": "West",    // Sneha Singh - Cement Specialist
  // Legacy CMs (kept for backward compatibility)
  "p_cm_1": "North",
  "p_cm_2": "South", 
  "p_cm_3": "West",
};

/**
 * City to Region Mapping
 * Maps major cities to their regions
 */
export const CITY_TO_REGION: Record<string, Region> = {
  // North
  "Delhi": "North",
  "New Delhi": "North",
  "Gurgaon": "North",
  "Noida": "North",
  "Chandigarh": "North",
  "Jaipur": "North",
  "Lucknow": "North",
  "Kanpur": "North",
  "Agra": "North",
  
  // South
  "Bangalore": "South",
  "Bengaluru": "South",
  "Chennai": "South",
  "Hyderabad": "South",
  "Coimbatore": "South",
  "Kochi": "South",
  "Trivandrum": "South",
  "Mysore": "South",
  "Visakhapatnam": "South",
  
  // East
  "Kolkata": "East",
  "Bhubaneswar": "East",
  "Ranchi": "East",
  "Patna": "East",
  "Guwahati": "East",
  
  // West
  "Mumbai": "West",
  "Pune": "West",
  "Ahmedabad": "West",
  "Surat": "West",
  "Nagpur": "West",
  "Indore": "West",
  "Vadodara": "West",
};

/**
 * Get region from city name (case-insensitive)
 */
export function getRegionFromCity(city: string): Region | undefined {
  if (!city) return undefined;
  
  // Normalize city name
  const normalized = city.trim();
  
  // Try exact match first
  if (CITY_TO_REGION[normalized]) {
    return CITY_TO_REGION[normalized];
  }
  
  // Try case-insensitive match
  const lowercaseCity = normalized.toLowerCase();
  for (const [mappedCity, region] of Object.entries(CITY_TO_REGION)) {
    if (mappedCity.toLowerCase() === lowercaseCity) {
      return region;
    }
  }
  
  return undefined;
}

/**
 * Get CM persona ID for a region
 */
export function getCMForRegion(region: Region): string | undefined {
  for (const [cmPersonaId, cmRegion] of Object.entries(CM_REGIONS)) {
    if (cmRegion === region) {
      return cmPersonaId;
    }
  }
  return undefined;
}

/**
 * Get CM persona ID for a city
 */
export function getCMForCity(city: string): string | undefined {
  const region = getRegionFromCity(city);
  if (!region) return undefined;
  return getCMForRegion(region);
}

/**
 * Get region for a CM persona ID
 */
export function getRegionForCM(cmPersonaId: string): Region | undefined {
  return CM_REGIONS[cmPersonaId];
}