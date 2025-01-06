import { Client, Wallet, xrpToDrops } from 'xrpl';

interface TokenAmount {
    currency: string;
    issuer?: string;
    value: string;
}

interface PoolState {
    tokens: {
        token1: TokenAmount;
        token2: TokenAmount;
    };
    lpTokens: TokenAmount;
    tradingFee: number;
    totalLiquidity: string;
}

interface SwapProtectionConfig {
    maxSlippage: number;      // 最大允许滑点
    maxPriceImpact: number;   // 最大价格影响
    deadline: number;         // 交易截止时间
    minOutput: string;        // 最小输出量
}

interface PriceImpactResult {
    priceImpact: number;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    warning?: string;
}

export class AMMTransaction {
    private client: Client;
    private readonly FEE_DENOMINATOR = 10000;
    
    constructor(isTestnet: boolean = true) {
        this.client = new Client(isTestnet 
            ? 'wss://s.altnet.rippletest.net:51233'
            : 'wss://xrplcluster.com');
    }

    async connect() {
        if (!this.client.isConnected()) {
            await this.client.connect();
        }
    }

    async createPool(
        wallet: Wallet,
        token1: TokenAmount,
        token2: TokenAmount,
        tradingFee: number = 0.005 // 0.5% default fee
    ) {
        try {
            await this.connect();
            
            // 验证输入
            this.validateTokenAmount(token1);
            this.validateTokenAmount(token2);
            
            const tx = {
                TransactionType: "AMMCreate",
                Account: wallet.address,
                Amount: token1,
                Amount2: token2,
                TradingFee: Math.floor(tradingFee * this.FEE_DENOMINATOR),
                Fee: "10",
            };

            return await this.submitTransaction(wallet, tx);
        } catch (error) {
            console.error('Failed to create AMM pool:', error);
            throw error;
        }
    }

    async addLiquidity(
        wallet: Wallet,
        token1: TokenAmount,
        token2: TokenAmount,
        slippage: number = 0.01,
        deadline?: number
    ) {
        try {
            await this.connect();

            // 1. 验证输入
            this.validateTokenAmount(token1);
            this.validateTokenAmount(token2);
            
            // 2. 获取池状态
            const poolState = await this.getPoolState(token1, token2);
            
            // 3. 计算添加流动性的详情
            const {
                token1Amount,
                token2Amount,
                lpTokensToMint,
                shareOfPool
            } = this.calculateLiquidityDetails(
                token1,
                token2,
                poolState
            );

            // 4. 验证流动性比例
            if (poolState.totalLiquidity !== "0") {
                this.validateLiquidityRatio(
                    token1Amount,
                    token2Amount,
                    poolState
                );
            }

            // 5. 计算最小接收量（考虑滑点）
            const minToken1 = (Number(token1Amount) * (1 - slippage)).toString();
            const minToken2 = (Number(token2Amount) * (1 - slippage)).toString();

            // 6. 构建交易
            const tx = {
                TransactionType: "AMMDeposit",
                Account: wallet.address,
                Amount: {
                    currency: token1.currency,
                    issuer: token1.issuer,
                    value: token1Amount
                },
                Amount2: {
                    currency: token2.currency,
                    issuer: token2.issuer,
                    value: token2Amount
                },
                MinimumToken1: {
                    currency: token1.currency,
                    issuer: token1.issuer,
                    value: minToken1
                },
                MinimumToken2: {
                    currency: token2.currency,
                    issuer: token2.issuer,
                    value: minToken2
                },
                Fee: "10",
                Flags: {
                    tfLimitQuality: true,
                    tfNoRippleDirect: true
                },
                Expiration: deadline ? deadline : Math.floor(Date.now() / 1000) + 300,
            };

            // 7. 提交交易
            const result = await this.submitTransaction(wallet, tx);

            // 8. 验证交易结果
            const actualLPTokens = this.extractLPTokensReceived(result);
            if (Number(actualLPTokens) < Number(lpTokensToMint) * (1 - slippage)) {
                throw new Error('Received less LP tokens than expected');
            }

            return {
                success: true,
                transactionHash: result.result.hash,
                lpTokensReceived: actualLPTokens,
                shareOfPool,
                token1Deposited: token1Amount,
                token2Deposited: token2Amount
            };

        } catch (error) {
            console.error('Add liquidity failed:', error);
            throw error;
        }
    }

    async removeLiquidity(
        wallet: Wallet,
        lpTokens: TokenAmount,
        token1: TokenAmount,
        token2: TokenAmount,
        minToken1: string,
        minToken2: string
    ) {
        try {
            await this.connect();

            const tx = {
                TransactionType: "AMMWithdraw",
                Account: wallet.address,
                Asset: token1,
                Asset2: token2,
                LPTokens: lpTokens,
                Fee: "10",
                Flags: 0,
                MinimumToken1: {
                    currency: token1.currency,
                    issuer: token1.issuer,
                    value: minToken1
                },
                MinimumToken2: {
                    currency: token2.currency,
                    issuer: token2.issuer,
                    value: minToken2
                }
            };

            return await this.submitTransaction(wallet, tx);
        } catch (error) {
            console.error('Failed to remove liquidity:', error);
            throw error;
        }
    }

    async swap(
        wallet: Wallet,
        amountIn: TokenAmount,
        tokenOut: TokenAmount,
        slippage: number = 0.01,
        deadline?: number
    ) {
        try {
            await this.connect();

            // 1. 验证输入
            this.validateTokenAmount(amountIn);
            if (amountIn.currency === tokenOut.currency) {
                throw new Error('Cannot swap same tokens');
            }

            // 2. 获取池子信息和路径
            const poolInfo = await this.getPoolInfo(amountIn, tokenOut);
            if (!poolInfo || !poolInfo.asset || !poolInfo.asset2) {
                throw new Error('Pool not found');
            }

            // 3. 检查流动性是否充足
            if (Number(poolInfo.asset.value) === 0 || Number(poolInfo.asset2.value) === 0) {
                throw new Error('Insufficient liquidity');
            }

            // 4. 计算交易详情
            const {
                expectedOutput,
                priceImpact,
                minimumReceived,
                path
            } = await this.calculateSwapDetails(
                amountIn,
                tokenOut,
                poolInfo,
                slippage
            );

            // 5. 价格影响检查
            if (priceImpact > 0.05) { // 5% 价格影响警告
                console.warn(`High price impact: ${(priceImpact * 100).toFixed(2)}%`);
            }
            if (priceImpact > 0.15) { // 15% 价格影响阻止
                throw new Error('Price impact too high');
            }

            // 6. 构建交易
            const tx = {
                TransactionType: "AMMSwap",
                Account: wallet.address,
                AmountIn: {
                    currency: amountIn.currency,
                    issuer: amountIn.issuer,
                    value: amountIn.value
                },
                Asset: {
                    currency: tokenOut.currency,
                    issuer: tokenOut.issuer
                },
                MinimumOut: {
                    currency: tokenOut.currency,
                    issuer: tokenOut.issuer,
                    value: minimumReceived
                },
                Fee: "10",
                Flags: {
                    tfLimitQuality: true,
                    tfPartialPayment: false,
                    tfNoRippleDirect: true
                },
                Paths: path,
                Expiration: deadline ? deadline : Math.floor(Date.now() / 1000) + 300, // 5分钟后过期
            };

            // 7. 提交交易
            const result = await this.submitTransaction(wallet, tx);

            // 8. 验证交易结果
            const finalAmount = this.extractReceivedAmount(result);
            if (Number(finalAmount) < Number(minimumReceived)) {
                throw new Error('Received amount less than minimum expected');
            }

            return {
                success: true,
                transactionHash: result.result.hash,
                amountIn: amountIn.value,
                amountOut: finalAmount,
                priceImpact,
                path: path
            };

        } catch (error) {
            console.error('Swap failed:', error);
            throw error;
        }
    }

    async getPoolInfo(token1: TokenAmount, token2: TokenAmount) {
        try {
            await this.connect();

            const request = {
                command: "amm_info",
                asset: { 
                    currency: token1.currency,
                    issuer: token1.issuer
                },
                asset2: { 
                    currency: token2.currency,
                    issuer: token2.issuer
                }
            };

            const response = await this.client.request(request);
            return response.result;
        } catch (error) {
            console.error('Failed to get pool info:', error);
            throw error;
        }
    }

    private calculateExpectedOutput(
        amountIn: TokenAmount,
        tokenOut: TokenAmount,
        poolInfo: any
    ): string {
        // 使用恒定乘积公式: x * y = k
        const reserveIn = poolInfo.asset.value;
        const reserveOut = poolInfo.asset2.value;
        const amountInWithFee = Number(amountIn.value) * 0.997; // 0.3% fee
        const numerator = amountInWithFee * Number(reserveOut);
        const denominator = Number(reserveIn) + amountInWithFee;
        return (numerator / denominator).toString();
    }

    async disconnect() {
        if (this.client.isConnected()) {
            await this.client.disconnect();
        }
    }

    async getPoolState(token1: TokenAmount, token2: TokenAmount): Promise<PoolState> {
        try {
            const poolInfo = await this.getPoolInfo(token1, token2);
            return this.parsePoolInfo(poolInfo);
        } catch (error) {
            console.error('Failed to get pool state:', error);
            throw error;
        }
    }

    // 辅助方法
    private validateTokenAmount(token: TokenAmount) {
        if (!token.currency || !token.value) {
            throw new Error('Invalid token amount');
        }
        if (Number(token.value) <= 0) {
            throw new Error('Token amount must be positive');
        }
    }

    private validateLiquidityRatio(
        token1: TokenAmount,
        token2: TokenAmount,
        poolState: PoolState
    ) {
        if (poolState.totalLiquidity !== "0") {
            const currentRatio = Number(poolState.tokens.token1.value) / 
                               Number(poolState.tokens.token2.value);
            const newRatio = Number(token1.value) / Number(token2.value);
            const ratioDeviation = Math.abs(currentRatio - newRatio) / currentRatio;
            
            if (ratioDeviation > 0.01) { // 1% 偏差
                throw new Error('Liquidity ratio mismatch');
            }
        }
    }

    private calculateSwapDetails(
        amountIn: TokenAmount,
        tokenOut: TokenAmount,
        poolInfo: any
    ) {
        const reserveIn = poolInfo.asset.value;
        const reserveOut = poolInfo.asset2.value;
        const amountInWithFee = Number(amountIn.value) * 0.997;
        
        // 计算输出量
        const expectedOutput = this.calculateExpectedOutput(
            amountIn,
            tokenOut,
            poolInfo
        );
        
        // 计算价格影响
        const priceImpact = this.calculatePriceImpact(
            amountInWithFee,
            expectedOutput,
            reserveIn,
            reserveOut
        );

        return { expectedOutput, priceImpact };
    }

    private calculatePriceImpact(
        amountIn: number,
        amountOut: string,
        reserveIn: string,
        reserveOut: string
    ): number {
        const midPrice = Number(reserveOut) / Number(reserveIn);
        const exactQuote = midPrice * amountIn;
        const priceImpact = (Number(amountOut) - exactQuote) / exactQuote;
        return Math.abs(priceImpact);
    }

    private calculateSlippageRate(slippage: number) {
        return {
            numerator: Math.floor((1 - slippage) * 100000000),
            denominator: 100000000
        };
    }

    private async submitTransaction(wallet: Wallet, tx: any) {
        const prepared = await this.client.autofill(tx);
        const signed = wallet.sign(prepared);
        const result = await this.client.submitAndWait(signed.tx_blob);
        
        // 验证交易结果
        if (result.result.meta.TransactionResult !== "tesSUCCESS") {
            throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`);
        }
        
        return result;
    }

    private parsePoolInfo(poolInfo: any): PoolState {
        return {
            tokens: {
                token1: poolInfo.asset,
                token2: poolInfo.asset2
            },
            lpTokens: poolInfo.lp_token,
            tradingFee: Number(poolInfo.trading_fee) / this.FEE_DENOMINATOR,
            totalLiquidity: poolInfo.total_liquidity
        };
    }

    // 新增：提取实际收到的金额
    private extractReceivedAmount(txResult: any): string {
        const changes = txResult.result.meta.AffectedNodes;
        // 实现从交易结果中提取实际收到的金额的逻辑
        // ...
        return "0"; // 替换为实际实现
    }

    // 改进：计算交易详情
    private async calculateSwapDetails(
        amountIn: TokenAmount,
        tokenOut: TokenAmount,
        poolInfo: any,
        slippage: number
    ) {
        const reserveIn = poolInfo.asset.value;
        const reserveOut = poolInfo.asset2.value;
        
        // 计算输出量（考虑手续费）
        const amountInWithFee = Number(amountIn.value) * 0.997; // 0.3% fee
        const expectedOutput = this.calculateExpectedOutput(
            amountIn,
            tokenOut,
            poolInfo
        );

        // 计算价格影响
        const priceImpact = this.calculatePriceImpact(
            amountInWithFee,
            expectedOutput,
            reserveIn,
            reserveOut
        );

        // 计算最小接收量
        const minimumReceived = (
            Number(expectedOutput) * (1 - slippage)
        ).toString();

        // 获取最优交易路径
        const path = await this.findBestTradingPath(
            amountIn,
            tokenOut,
            expectedOutput
        );

        return {
            expectedOutput,
            priceImpact,
            minimumReceived,
            path
        };
    }

    // 新增：查找最优交易路径
    private async findBestTradingPath(
        amountIn: TokenAmount,
        tokenOut: TokenAmount,
        expectedOutput: string
    ): Promise<any[]> {
        // 实现路径查找算法
        // ...
        return [];
    }

    // 新增：计算流动性详情
    private calculateLiquidityDetails(
        token1: TokenAmount,
        token2: TokenAmount,
        poolState: PoolState
    ) {
        let token1Amount = token1.value;
        let token2Amount = token2.value;
        let lpTokensToMint = "0";
        let shareOfPool = 0;

        if (poolState.totalLiquidity === "0") {
            // 首次添加流动性
            lpTokensToMint = Math.sqrt(
                Number(token1Amount) * Number(token2Amount)
            ).toString();
            shareOfPool = 1;
        } else {
            // 计算应该添加的确切数量
            const reserve1 = poolState.tokens.token1.value;
            const reserve2 = poolState.tokens.token2.value;
            
            // 确保按照当前池子比例添加
            const amount2Optimal = (Number(token1Amount) * Number(reserve2)) / Number(reserve1);
            
            if (amount2Optimal <= Number(token2Amount)) {
                token2Amount = amount2Optimal.toString();
            } else {
                const amount1Optimal = (Number(token2Amount) * Number(reserve1)) / Number(reserve2);
                token1Amount = amount1Optimal.toString();
            }
            
            // 计算将获得的LP代币数量
            lpTokensToMint = Math.min(
                (Number(token1Amount) * Number(poolState.totalLiquidity)) / Number(reserve1),
                (Number(token2Amount) * Number(poolState.totalLiquidity)) / Number(reserve2)
            ).toString();
            
            // 计算将拥有的池子份额
            shareOfPool = Number(lpTokensToMint) / (Number(poolState.totalLiquidity) + Number(lpTokensToMint));
        }

        return {
            token1Amount,
            token2Amount,
            lpTokensToMint,
            shareOfPool
        };
    }

    // 新增：提取收到的LP代币数量
    private extractLPTokensReceived(txResult: any): string {
        const changes = txResult.result.meta.AffectedNodes;
        // 实现从交易结果中提取LP代币数量的逻辑
        // ...
        return "0"; // 替换为实际实现
    }

    async swapWithProtection(
        wallet: Wallet,
        amountIn: TokenAmount,
        tokenOut: TokenAmount,
        protectionConfig: Partial<SwapProtectionConfig> = {}
    ) {
        try {
            const config = this.getDefaultProtectionConfig(protectionConfig);
            
            // 1. 验证输入
            await this.validateSwapInput(amountIn, tokenOut);

            // 2. 获取当前市场数据
            const marketData = await this.getMarketData(amountIn, tokenOut);
            
            // 3. 计算价格影响
            const priceImpactResult = this.calculatePriceImpactWithSeverity(
                amountIn,
                marketData
            );

            // 4. 验证价格影响
            this.validatePriceImpact(priceImpactResult, config.maxPriceImpact);

            // 5. 计算最小输出量
            const minOutputAmount = this.calculateMinimumOutput(
                marketData.expectedOutput,
                config.maxSlippage
            );

            // 6. 构建交易
            const tx = await this.buildProtectedSwapTx(
                wallet,
                amountIn,
                tokenOut,
                minOutputAmount,
                config,
                marketData.path
            );

            // 7. 执行交易
            const result = await this.executeProtectedSwap(wallet, tx);

            // 8. 验证交易结果
            return this.validateAndReturnSwapResult(result, minOutputAmount);

        } catch (error) {
            console.error('Protected swap failed:', error);
            throw error;
        }
    }

    private getDefaultProtectionConfig(
        config: Partial<SwapProtectionConfig>
    ): SwapProtectionConfig {
        return {
            maxSlippage: config.maxSlippage || 0.005, // 默认 0.5%
            maxPriceImpact: config.maxPriceImpact || 0.15, // 默认 15%
            deadline: config.deadline || Math.floor(Date.now() / 1000) + 300, // 默认5分钟
            minOutput: config.minOutput || '0'
        };
    }

    private async validateSwapInput(amountIn: TokenAmount, tokenOut: TokenAmount) {
        // 基本验证
        this.validateTokenAmount(amountIn);
        if (amountIn.currency === tokenOut.currency) {
            throw new Error('Cannot swap same tokens');
        }

        // 检查流动性
        const poolInfo = await this.getPoolInfo(amountIn, tokenOut);
        if (!this.hasEnoughLiquidity(poolInfo)) {
            throw new Error('Insufficient liquidity in pool');
        }
    }

    private hasEnoughLiquidity(poolInfo: any): boolean {
        return poolInfo &&
               poolInfo.asset &&
               poolInfo.asset2 &&
               Number(poolInfo.asset.value) > 0 &&
               Number(poolInfo.asset2.value) > 0;
    }

    private calculatePriceImpactWithSeverity(
        amountIn: TokenAmount,
        marketData: any
    ): PriceImpactResult {
        const priceImpact = this.calculatePriceImpact(
            Number(amountIn.value),
            marketData.expectedOutput,
            marketData.reserveIn,
            marketData.reserveOut
        );

        let severity: PriceImpactResult['severity'] = 'LOW';
        let warning: string | undefined;

        if (priceImpact > 0.15) {
            severity = 'VERY_HIGH';
            warning = 'Price impact too high, transaction may be frontrun';
        } else if (priceImpact > 0.10) {
            severity = 'HIGH';
            warning = 'High price impact';
        } else if (priceImpact > 0.05) {
            severity = 'MEDIUM';
            warning = 'Medium price impact';
        }

        return { priceImpact, severity, warning };
    }

    private validatePriceImpact(
        priceImpactResult: PriceImpactResult,
        maxPriceImpact: number
    ) {
        if (priceImpactResult.priceImpact > maxPriceImpact) {
            throw new Error(
                `Price impact too high: ${(priceImpactResult.priceImpact * 100).toFixed(2)}% > ${(maxPriceImpact * 100).toFixed(2)}%`
            );
        }
        if (priceImpactResult.warning) {
            console.warn(priceImpactResult.warning);
        }
    }

    private calculateMinimumOutput(
        expectedOutput: string,
        maxSlippage: number
    ): string {
        const minOutput = Number(expectedOutput) * (1 - maxSlippage);
        return minOutput.toString();
    }

    private async buildProtectedSwapTx(
        wallet: Wallet,
        amountIn: TokenAmount,
        tokenOut: TokenAmount,
        minOutputAmount: string,
        config: SwapProtectionConfig,
        path: any[]
    ) {
        return {
            TransactionType: "AMMSwap",
            Account: wallet.address,
            AmountIn: {
                currency: amountIn.currency,
                issuer: amountIn.issuer,
                value: amountIn.value
            },
            Asset: {
                currency: tokenOut.currency,
                issuer: tokenOut.issuer
            },
            MinimumOut: {
                currency: tokenOut.currency,
                issuer: tokenOut.issuer,
                value: minOutputAmount
            },
            Fee: "10",
            Flags: {
                tfLimitQuality: true,        // 确保获得最佳价格
                tfPartialPayment: false,     // 禁止部分支付
                tfNoRippleDirect: true       // 使用最直接的路径
            },
            Paths: path,
            Expiration: config.deadline
        };
    }

    private async executeProtectedSwap(wallet: Wallet, tx: any) {
        const prepared = await this.client.autofill(tx);
        const signed = wallet.sign(prepared);
        return await this.client.submitAndWait(signed.tx_blob);
    }

    private validateAndReturnSwapResult(result: any, minOutputAmount: string) {
        // 验证交易状态
        if (result.result.meta.TransactionResult !== "tesSUCCESS") {
            throw new Error(`Transaction failed: ${result.result.meta.TransactionResult}`);
        }

        // 提取实际收到的金额
        const receivedAmount = this.extractReceivedAmount(result);
        
        // 验证收到的金额是否满足最小要求
        if (Number(receivedAmount) < Number(minOutputAmount)) {
            throw new Error(
                `Received amount (${receivedAmount}) less than minimum expected (${minOutputAmount})`
            );
        }

        return {
            success: true,
            transactionHash: result.result.hash,
            receivedAmount,
            effectivePrice: Number(result.result.meta.delivered_amount) / Number(tx.AmountIn.value),
            priceImpact: result.priceImpact
        };
    }

    // 改进提取实际收到金额的方法
    private extractReceivedAmount(txResult: any): string {
        const changes = txResult.result.meta.AffectedNodes;
        let receivedAmount = "0";

        for (const change of changes) {
            if (change.ModifiedNode && change.ModifiedNode.LedgerEntryType === "AccountRoot") {
                // 这里需要根据具体的 XRPL 交易结果结构来实现
                // 通常需要查找账户余额的变化
                const finalBalance = change.ModifiedNode.FinalFields.Balance;
                const previousBalance = change.ModifiedNode.PreviousFields.Balance;
                receivedAmount = (Number(finalBalance) - Number(previousBalance)).toString();
                break;
            }
        }

        return receivedAmount;
    }
}