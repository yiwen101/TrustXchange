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
    const calculateZeroPoint = (currentPrice:number,strikePrice:number,optionPrice:number) => {
        return optionType === 'Put' ? strikePrice - optionPrice :strikePrice + optionPrice;
    };
    
    const generatePositivePayoffData = (currentPrice:number,strikePrice:number,optionPrice:number) => {
        const zeroPint = calculateZeroPoint(currentPrice, strikePrice, optionPrice);
        const minPrice =  optionType === 'Put' ? 0 : zeroPint;
        const maxPrice = optionType === 'Put' ? zeroPint : currentPrice * 2;
        
        return generatePayoffData(strikePrice,optionPrice, minPrice, maxPrice);
    }

    const generateMiddleSegmentData = (currentPrice:number,strikePrice:number,optionPrice:number) => {
        const zeroPint = calculateZeroPoint(currentPrice, strikePrice, optionPrice);
        const minPrice =  Math.min(zeroPint, strikePrice);
        const maxPrice = Math.max(zeroPint, strikePrice);
        
        return generatePayoffData(strikePrice,optionPrice, minPrice, maxPrice);
    }
    const generateLossData = (currentPrice:number,strikePrice:number,optionPrice:number) => {
        const minPrice =  optionType === 'Put' ? strikePrice : 0;
        const maxPrice = optionType === 'Put' ? currentPrice * 2 : strikePrice;
        
        return generatePayoffData(strikePrice,optionPrice, minPrice, maxPrice);
    }

    const generatePayoffData = (strikePrice:number,optionPrice:number, from:number, to:number) => {
        const data = [];
        for (let price = from; price <= to; price +=  0.1) {
            let pnl = 0;
            if (optionType === 'Put') {
                pnl = Math.max(strikePrice - price, 0) - optionPrice;
            } else {
                pnl = Math.max(price - strikePrice, 0) - optionPrice;
            }
            data.push({ underlyingPrice: price, pnl });
        }
        return data;
    }

    const profitData = generatePositivePayoffData(currentPrice, strikePrice, optionPrice);
    const middleData = generateMiddleSegmentData(currentPrice, strikePrice, optionPrice);
    const lossData = generateLossData(currentPrice, strikePrice, optionPrice);
    const data = [...profitData, ...middleData, ...lossData];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <XAxis 
                    dataKey="underlyingPrice" 
                    type="number"
                    domain={['auto', 'auto']}
                />
                <YAxis 
                    type="number"
                    domain={[-optionPrice-1 , (dataMax: number) => Math.max(dataMax, 0)]}
                />
                <Line 
                    data={profitData}
                    type="linear"
                    dataKey="pnl"
                    stroke="blue"
                    dot={false}
                    strokeWidth={2}
                />
                <Line 
                    data={middleData}
                    type="linear"
                    dataKey="pnl"
                    stroke="red"
                    dot={false}
                    strokeWidth={2}
                />
                <Line 
                    data={lossData}
                    type="linear"
                    dataKey="pnl"
                    stroke="red"
                    dot={false}
                    strokeWidth={2}
                />
                <ReferenceLine y={0} stroke="black" />
            </LineChart>
        </ResponsiveContainer>
    );
};