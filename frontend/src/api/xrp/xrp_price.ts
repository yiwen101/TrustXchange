import axios from 'axios';

export class XRPPrice {
    private baseUrl: string = 'https://api.coingecko.com/api/v3';

    async getCurrentPrice(currency: string = 'usd'): Promise<number> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/simple/price?ids=ripple&vs_currencies=${currency}`
            );
            return response.data.ripple[currency];
        } catch (error) {
            console.error('Failed to fetch XRP price:', error);
            throw error;
        }
    }

    async getPriceHistory(days: number = 7, currency: string = 'usd') {
        try {
            const response = await axios.get(
                `${this.baseUrl}/coins/ripple/market_chart?vs_currency=${currency}&days=${days}`
            );
            return response.data.prices;
        } catch (error) {
            console.error('Failed to fetch XRP price history:', error);
            throw error;
        }
    }
}
