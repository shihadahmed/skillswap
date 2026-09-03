/**
 * Marketplace Fee Calculation Helper
 * Shared between frontend and backend (CommonJS compatible).
 * Fee Structure:
 * - Freelancer Platform Service Fee: 10% of bid
 * - Client Platform Service Fee: 5% of bid
 * - VAT: 5% on Client Service Fee
 * - Gateway (Stripe): 2.9% + $0.30 on (bid + client fees + VAT)
 *
 * Deposit (wallet top-up) fee structure:
 * - Platform Service Fee: 3% of depositAmount
 * - VAT / Tax: 5% of depositAmount
 * - Stripe Processing Fee: pass-through 2.9% + $0.30 on (deposit + platform + VAT)
 *   computed as: round2((subtotal + 0.30) / (1 - 0.029) - subtotal)
 *   so that the client pays the full Stripe cost on top of the platform's cut.
 */

const FREELANCER_FEE_RATE = 0.10;
const CLIENT_SERVICE_FEE_RATE = 0.05;
const VAT_RATE = 0.05;
const GATEWAY_FEE_RATE = 0.029;
const GATEWAY_FIXED_FEE = 0.30;

const DEPOSIT_PLATFORM_FEE_RATE = 0.03;
const DEPOSIT_VAT_RATE = 0.05;
const STRIPE_PCT = 0.029;
const STRIPE_FIXED = 0.30;

function round2(n) {
  return Math.round(n * 100) / 100;
}

/**
 * Calculate all marketplace fees for a given bid amount.
 * @param {number} bidAmount - The freelancer's proposed bid (base amount)
 * @returns {Object} Complete fee breakdown
 */
function calculateMarketplaceFees(bidAmount) {
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
 * Calculate all fees for a wallet top-up / deposit.
 * @param {number} depositAmount - Base USD amount to credit to the wallet.
 * @returns {{ depositAmount:number, platformFee:number, taxVat:number,
 *            stripeProcessingFee:number, totalToCharge:number }}
 */
function calculateDepositFees(depositAmount) {
  const base = Number(depositAmount) || 0;

  const platformFee = round2(base * DEPOSIT_PLATFORM_FEE_RATE);
  const taxVat = round2(base * DEPOSIT_VAT_RATE);

  const subtotal = base + platformFee + taxVat;
  // Pass-through Stripe processing fee: solve fee so that
  //   subtotal + fee - 0.029 * (subtotal + fee) = subtotal
  // i.e. net deposit to SkillSwap = subtotal after Stripe takes 2.9% + $0.30.
  const stripeProcessingFee =
    Math.round(((subtotal + STRIPE_FIXED) / (1 - STRIPE_PCT) - subtotal) * 100) / 100;
  const totalToCharge = Math.round((subtotal + stripeProcessingFee) * 100) / 100;

  return {
    depositAmount: base,
    platformFee,
    taxVat,
    stripeProcessingFee,
    totalToCharge,
  };
}

module.exports = {
  calculateMarketplaceFees,
  calculateDepositFees,
  FREELANCER_FEE_RATE,
  CLIENT_SERVICE_FEE_RATE,
  VAT_RATE,
  GATEWAY_FEE_RATE,
  GATEWAY_FIXED_FEE,
  DEPOSIT_PLATFORM_FEE_RATE,
  DEPOSIT_VAT_RATE,
};