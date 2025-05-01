
// Currency utility for handling Algerian Dinar formatting

// Function to format price in Algerian Dinars
export const formatPrice = (price: number): string => {
  // Convert from the base currency (e.g., USD) to DZD
  // Using an approximate conversion rate (1 USD ≈ 134 DZD as of April 2025)
  const dzdPrice = Math.round(price * 134);
  
  // Format with thousand separators
  return `${dzdPrice.toLocaleString('fr-DZ')} DA`;
};

// Function to convert price to DZD for calculations
export const toDZD = (price: number): number => {
  return Math.round(price * 134);
};
