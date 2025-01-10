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
    optionPrice: number;
    optionType: 'Call' | 'Put';
}

export const OptionPayoffChart: React.FC<OptionPayoffChartProps> = ({
    strikePrice,
    currentPrice,
    optionPrice,
    optionType
}) => {
    console.log(strikePrice, currentPrice, optionPrice, optionType);
    const generatePayoffData = (currentPrice:number,strikePrice:number,optionPrice:number) => {
        const data = [];
        const minPrice = 0;
        const maxPrice = currentPrice * 2;
        
        for (let price = minPrice; price <= maxPrice; price +=  0.1) {
            let pnl = 0;
            if (optionType === 'Put') {
                pnl = Math.max(strikePrice - price, 0) - optionPrice;
            } else {
                pnl = Math.max(price - strikePrice, 0) - optionPrice;
            }
            data.push({ underlyingPrice: price, pnl });
        }
        return data;
    };

    const data = generatePayoffData(currentPrice, strikePrice, optionPrice);
    console.log(data);
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
                <ReferenceLine y={-optionPrice} stroke="gray" strokeDasharray="3 3" />
            </LineChart>
        </ResponsiveContainer>
    );
}; 