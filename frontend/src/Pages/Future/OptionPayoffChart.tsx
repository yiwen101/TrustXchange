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
    const calculateZeroPoint = (currentPrice: number, strikePrice: number, optionPrice: number) => {
        return optionType === 'Put' ? strikePrice - optionPrice : strikePrice + optionPrice;
    };

    const generatePositivePayoffData = (currentPrice: number, strikePrice: number, optionPrice: number) => {
        const zeroPoint = calculateZeroPoint(currentPrice, strikePrice, optionPrice);
        const minPrice = optionType === 'Put' ? 0 : zeroPoint;
        const maxPrice = optionType === 'Put' ? zeroPoint : currentPrice * 2;

        return generatePayoffData(strikePrice, optionPrice, minPrice, maxPrice);
    };

    const generateMiddleSegmentData = (currentPrice: number, strikePrice: number, optionPrice: number) => {
        const zeroPoint = calculateZeroPoint(currentPrice, strikePrice, optionPrice);
        const minPrice = Math.min(zeroPoint, strikePrice);
        const maxPrice = Math.max(zeroPoint, strikePrice);

        return generatePayoffData(strikePrice, optionPrice, minPrice, maxPrice);
    };

    const generateLossData = (currentPrice: number, strikePrice: number, optionPrice: number) => {
        const minPrice = optionType === 'Put' ? strikePrice : 0;
        const maxPrice = optionType === 'Put' ? currentPrice * 2 : strikePrice;

        return generatePayoffData(strikePrice, optionPrice, minPrice, maxPrice);
    };

    const getPnl = (strikePrice: number, optionPrice: number, price: number) => {
        if (optionType === 'Put') {
            return Math.max(strikePrice - price, 0) - optionPrice;
        } else {
            return Math.max(price - strikePrice, 0) - optionPrice;
        }
    };

    const generatePayoffData = (strikePrice: number, optionPrice: number, from: number, to: number) => {
        const data = [];
        for (let price = from; price <= to; price += 0.05) {
            const pnl = getPnl(strikePrice, optionPrice, price);
            data.push({ underlyingPrice: price, pnl });
        }
        data.push({ underlyingPrice: to, pnl: getPnl(strikePrice, optionPrice, to) });
        return data;
    };

    const profitData = generatePositivePayoffData(currentPrice, strikePrice, optionPrice);
    const middleData = generateMiddleSegmentData(currentPrice, strikePrice, optionPrice);
    const lossData = generateLossData(currentPrice, strikePrice, optionPrice);
    const data = [...profitData, ...middleData, ...lossData];

    const zeroPrice = calculateZeroPoint(currentPrice, strikePrice, optionPrice);

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
                    domain={[-optionPrice - 1, (dataMax: number) => Math.max(dataMax, 0)]}
                    tickFormatter={(value) => value.toFixed(2)}
                />
                <Line
                    data={profitData}
                    type="linear"
                    dataKey="pnl"
                    stroke="green"
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
                <ReferenceLine
                    x={zeroPrice}
                    stroke="blue"
                    label={{ value: `Zero Price: ${zeroPrice.toFixed(2)}`, position: 'top', fill: 'blue' }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};