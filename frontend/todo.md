Smart Contracts (On-Chain):

Core Financial Actions:
POST /loans: Request a loan.
POST /repay-loan/{loanID}: Repay a loan.
POST /add-collateral/{loanID}: Add collateral to a loan.
POST /liquidity-contributions: Add liquidity to the pool.
POST /withdraw-contribution/{contributionID}: Withdraw liquidity.
Backend Server (Off-Chain):

Data Retrieval & Formatting:
GET /transactions: Get user's transaction history.
GET /active-loan: Get details of user's active loan.
GET /active-contribution: Get details of user's active contribution.
Get /meta:
const COLLATERAL_MULTIPLIER = 1.5; // Example multiplier
const INTEREST_RATE = 0.12;  // 12% as a decimal
const INTEREST_TERM = "Annual interest, compounding daily";
const dailyInterest = BigNumber(1.12).log(365).toNumber(); // Daily interest rate