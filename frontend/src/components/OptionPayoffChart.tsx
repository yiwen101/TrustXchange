import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
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
    // 生成损益数据点
    const generatePayoffData = () => {
        const data = [];
        // 生成从0.7倍执行价到1.3倍执行价的点，使曲线更平滑
        for (let price = strikePrice * 0.7; price <= strikePrice * 1.3; price += strikePrice * 0.02) {
            let pnl = 0;
            if (optionType === 'Call') {
                pnl = price <= strikePrice 
                    ? -premium  // 价格低于执行价时，损失固定为期权费
                    : price - strikePrice - premium;  // 价格高于执行价时，收益线性增加
            } else {
                pnl = price >= strikePrice 
                    ? -premium  // 价格高于执行价时，损失固定为期权费
                    : strikePrice - price - premium;  // 价格低于执行价时，收益线性增加
            }
            data.push({ underlyingPrice: price, pnl });
        }
        return data;
    };

    const payoffData = generatePayoffData();

    return (
        <ResponsiveContainer width="100%" height={200}>
            <LineChart data={payoffData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis 
                    dataKey="underlyingPrice" 
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    stroke="#666"
                />
                <YAxis 
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                    stroke="#666"
                />
                <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'P&L']}
                    labelFormatter={(label) => `Price: $${Number(label).toFixed(2)}`}
                    contentStyle={{ backgroundColor: '#333', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke="#ff7300" 
                    dot={false}
                    strokeWidth={2}
                />
                <ReferenceLine x={strikePrice} stroke="gray" strokeDasharray="3 3" label={{ value: 'Strike', fill: '#666' }} />
                <ReferenceLine x={currentPrice} stroke="blue" strokeDasharray="3 3" label={{ value: 'Current', fill: '#666' }} />
                <ReferenceLine y={0} stroke="#666" />
                <ReferenceLine y={-premium} stroke="red" strokeDasharray="3 3" label={{ value: 'Premium', fill: '#666' }} />
            </LineChart>
        </ResponsiveContainer>
    );
}; 