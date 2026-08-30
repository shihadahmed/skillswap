/**
 * Marketplace Fee Calculation Helper (ES Module for Frontend)
 * Fee Structure:
 * - Freelancer Platform Service Fee: 10% of bid
 * - Client Platform Service Fee: 5% of bid
 * - VAT: 5% on Client Service Fee
 * - Gateway (Stripe): 2.9% + $0.30 on (bid + client fees + VAT)
 */

export const FREELANCER_FEE_RATE = 0.10;
export const CLIENT_SERVICE_FEE_RATE = 0.05;
export const VAT_RATE = 0.05;
export const GATEWAY_FEE_RATE = 0.029;
export const GATEWAY_FIXED_FEE = 0.30;

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate all marketplace fees for a given bid amount.
 * @param {number} bidAmount - The freelancer's proposed bid (base amount)
 * @returns {Object} Complete fee breakdown
 */
export function calculateMarketplaceFees(bidAmount) {
  const base = Number(bidAmount) || 0;

  // Freelancer side
  const freelancerFee = round2(base * FREELANCER_FEE_RATE);
  const freelancerNet = round2(base - freelancerFee);

  // Client side fees
  const clientServiceFee = round2(base * CLIENT_SERVICE_FEE_RATE);
  const vatAmount = round2(clientServiceFee * VAT_RATE);

  // Gateway fee on (base + clientServiceFee + vat)
  const gatewayBase = base + clientServiceFee + vatAmount;
  const gatewayFee = round2(gatewayBase * GATEWAY_FEE_RATE + GATEWAY_FIXED_FEE);

  const totalClient = round2(base + clientServiceFee + vatAmount + gatewayFee);
  const platformNetProfit = round2(freelancerFee + clientServiceFee);

  return {
    baseAmount: base,
    freelancerFeeDeducted: freelancerFee,
    freelancerNetPayout: freelancerNet,
    clientServiceFee,
    vatAmount,
    gatewayFee,
    totalPaidByClient: totalClient,
    platformNetProfit,
    // For display breakdown
    breakdown: {
      base,
      freelancerFee,
      freelancerNet,
      clientServiceFee,
      vatAmount,
      gatewayFee,
      totalClient,
      platformNetProfit,
    },
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}