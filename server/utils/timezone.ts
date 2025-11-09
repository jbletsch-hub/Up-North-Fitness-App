// Timezone utilities for Central Time (America/Chicago)

/**
 * Gets the current date in Central Time as YYYY-MM-DD string
 */
export function getCentralTimeDate(): string {
  const now = new Date();
  
  // Convert to Central Time
  const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  
  // Format as YYYY-MM-DD
  const year = centralTime.getFullYear();
  const month = String(centralTime.getMonth() + 1).padStart(2, '0');
  const day = String(centralTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets the start of the current week (Sunday) in Central Time as YYYY-MM-DD
 */
export function getCentralTimeWeekStart(): string {
  const now = new Date();
  const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  
  // Get day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = centralTime.getDay();
  
  // Calculate days to subtract to get to Sunday
  const daysToSunday = dayOfWeek;
  
  // Create new date for Sunday
  const sunday = new Date(centralTime);
  sunday.setDate(centralTime.getDate() - daysToSunday);
  
  // Format as YYYY-MM-DD
  const year = sunday.getFullYear();
  const month = String(sunday.getMonth() + 1).padStart(2, '0');
  const day = String(sunday.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets yesterday's date in Central Time as YYYY-MM-DD string
 */
export function getCentralTimeYesterday(): string {
  const now = new Date();
  const centralTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Chicago" }));
  
  // Subtract one day
  centralTime.setDate(centralTime.getDate() - 1);
  
  // Format as YYYY-MM-DD
  const year = centralTime.getFullYear();
  const month = String(centralTime.getMonth() + 1).padStart(2, '0');
  const day = String(centralTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
