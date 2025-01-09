import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';

interface OptionPayoffChartProps {
    strikePrice: number;
    currentPrice: number;
    premium: number;
    optionType: 'Call' | 'Put';
}

export const OptionPayoffChart: React.FC<OptionPayoffChartProps> = ({
    strikePrice,
    currentPrice,
    premium,
    optionType
}) => {
    const generatePayoffData = () => {
        const data = [];
        // 使用传入的 strikePrice 来确定范围
        const minPrice = strikePrice * 0.8;
        const maxPrice = strikePrice * 1.2;
        
        for (let price = minPrice; price <= maxPrice; price += strikePrice * 0.01) {
            let pnl = 0;
            if (optionType === 'Put') {
                if (price >= strikePrice) {
                    pnl = -premium;  // 使用传入的 premium 作为固定损失
                } else {
                    pnl = strikePrice - price - premium;  // 使用传入的 strikePrice 和 premium
                }
            } else {
                if (price <= strikePrice) {
                    pnl = -premium;
                } else {
                    pnl = price - strikePrice - premium;
                }
            }
            data.push({ underlyingPrice: price, pnl });
        }
        return data;
    };

    const data = generatePayoffData();
    const beforeStrike = data.filter(d => d.underlyingPrice < strikePrice);
    const afterStrike = data.filter(d => d.underlyingPrice >= strikePrice);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                    dataKey="underlyingPrice" 
                    type="number"
                    domain={['auto', 'auto']}
                />
                <YAxis 
                    type="number"
                    domain={['auto', 'auto']}
                />
                <Line 
                    data={beforeStrike}
                    type="linear"
                    dataKey="pnl"
                    stroke="blue"
                    dot={false}
                    strokeWidth={2}
                />
                <Line 
                    data={afterStrike}
                    type="linear"
                    dataKey="pnl"
                    stroke="red"
                    dot={false}
                    strokeWidth={2}
                />
                <ReferenceLine x={strikePrice} stroke="gray" strokeDasharray="3 3" />
                <ReferenceLine x={currentPrice} stroke="gray" strokeDasharray="3 3" />
                <ReferenceLine y={0} stroke="black" />
                <ReferenceLine y={-premium} stroke="gray" strokeDasharray="3 3" />
            </LineChart>
        </ResponsiveContainer>
    );
}; 