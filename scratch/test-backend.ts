import { calculateTradeMetrics, deriveSession, calculateSlippage } from '../src/lib/utils/trade-calculations';
import { createTradeSchema } from '../src/lib/validations/trade';
import { createTradePlanSchema } from '../src/lib/validations/trade-plan';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log('--- STARTING BACKEND CALCULATION & VALIDATION UNIT TESTS ---\n');

// Test 1: LONG Trade Metrics Calculation
const longTrade = calculateTradeMetrics({
  direction: 'long',
  position_size: 100,
  entry_price: 150,
  exit_price: 160,
  stop_loss: 145,
  take_profit: 165,
  fees_commissions: 10,
  account_balance_at_trade: 10000,
  entry_time: '2026-08-22T14:30:00Z', // 14:30 UTC -> overlap session
});

console.log('Long Trade Calculated Metrics:', longTrade);
// Raw PnL = (160 - 150) * 100 - 10 = $990
assert(longTrade.pnl_currency === 990, `PnL Currency should be 990, got ${longTrade.pnl_currency}`);
// Risk Amount = (150 - 145) * 100 = $500
assert(longTrade.risk_amount === 500, `Risk Amount should be 500, got ${longTrade.risk_amount}`);
// PnL % = (990 / 10000) * 100 = 9.9%
assert(longTrade.pnl_percent === 9.9, `PnL Percent should be 9.9%, got ${longTrade.pnl_percent}`);
// Risk % = (500 / 10000) * 100 = 5%
assert(longTrade.risk_percent_of_account === 5, `Risk Percent should be 5%, got ${longTrade.risk_percent_of_account}`);
// R-Multiple = 990 / 500 = 1.98R
assert(longTrade.r_multiple === 1.98, `R-Multiple should be 1.98R, got ${longTrade.r_multiple}`);
// Session = overlap (14:30 UTC)
assert(longTrade.session === 'overlap', `Session should be overlap, got ${longTrade.session}`);

console.log('\n---------------------------------------------------------');

// Test 2: SHORT Trade Metrics Calculation
const shortTrade = calculateTradeMetrics({
  direction: 'short',
  position_size: 2, // 2 futures contracts / lots
  entry_price: 4500,
  exit_price: 4520, // Stop loss hit / loss
  stop_loss: 4515,
  take_profit: 4470,
  fees_commissions: 5,
  account_balance_at_trade: 50000,
  entry_time: '2026-08-22T09:15:00Z', // 09:15 UTC -> london session
});

console.log('Short Trade Calculated Metrics:', shortTrade);
// Raw PnL = (4500 - 4520) * 2 - 5 = -45
assert(shortTrade.pnl_currency === -45, `PnL Currency should be -45, got ${shortTrade.pnl_currency}`);
// Risk Amount = (4515 - 4500) * 2 = 30
assert(shortTrade.risk_amount === 30, `Risk Amount should be 30, got ${shortTrade.risk_amount}`);
// R-Multiple = -45 / 30 = -1.5R
assert(shortTrade.r_multiple === -1.5, `R-Multiple should be -1.5R, got ${shortTrade.r_multiple}`);
// Session = london (09:15 UTC)
assert(shortTrade.session === 'london', `Session should be london, got ${shortTrade.session}`);

console.log('\n---------------------------------------------------------');

// Test 3: Slippage Calculation
const slippage = calculateSlippage(
  'long',
  150.50, // Actual Entry
  159.50, // Actual Exit
  150.00, // Planned Entry
  160.00  // Planned Target
);
console.log('Slippage Calculation:', slippage);
assert(slippage.entry_slippage === 0.5, `Entry slippage should be +0.50`);
assert(slippage.exit_slippage === 0.5, `Exit slippage should be +0.50`);
assert(slippage.total_slippage === 1.0, `Total slippage should be +1.00`);

console.log('\n---------------------------------------------------------');

// Test 4: Zod Trade Payload Validation
const validTradePayload = {
  asset: 'aapl',
  direction: 'long',
  position_size: 50,
  entry_price: 175.5,
  exit_price: 180,
  stop_loss: 173,
  take_profit: 182,
  entry_time: '2026-08-22T10:00:00.000Z',
  exit_time: '2026-08-22T12:00:00.000Z',
  account_balance_at_trade: 25000,
  exit_reason: 'manual_close',
  trade_grade: 4,
  setup_name: 'Breakout Bounce',
  emotional_state: 'Calm',
  mistake_tag_names: ['Early Exit', 'Moved Stop'],
};

const parsedTrade = createTradeSchema.safeParse(validTradePayload);
assert(parsedTrade.success === true, 'Zod trade payload validation should succeed');
if (parsedTrade.success) {
  assert(parsedTrade.data.asset === 'AAPL', 'Asset ticker should be transformed to uppercase AAPL');
}

// Test 5: Invalid Payload Validation (exit_time earlier than entry_time)
const invalidTradePayload = {
  ...validTradePayload,
  entry_time: '2026-08-22T14:00:00.000Z',
  exit_time: '2026-08-22T10:00:00.000Z',
};
const parsedInvalid = createTradeSchema.safeParse(invalidTradePayload);
assert(parsedInvalid.success === false, 'Zod should reject trade payload where exit_time is before entry_time');

console.log('\n🎉 ALL BACKEND TEST ASSERTIONS PASSED SUCCESSFULLY!');
