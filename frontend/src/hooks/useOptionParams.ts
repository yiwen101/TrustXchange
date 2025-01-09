import { useSearchParams } from 'react-router-dom';

interface OptionParams {
    optionType: 'Call' | 'Put';
    strikePrice: number;
    expirationDate: string;
    isValid: boolean;
}

export const useOptionParams = (): OptionParams => {
    const [searchParams] = useSearchParams();
    
    // 获取参数
    const type = searchParams.get('type');
    const strike = searchParams.get('strike');
    const expiration = searchParams.get('expiration');

    // 验证参数
    const isValidType = type === 'Call' || type === 'Put';
    const isValidStrike = strike !== null && !isNaN(Number(strike));
    const isValidExpiration = expiration !== null && !isNaN(Date.parse(expiration));

    return {
        optionType: isValidType ? (type as 'Call' | 'Put') : 'Put',
        strikePrice: isValidStrike ? Number(strike) : 0,
        expirationDate: isValidExpiration ? expiration! : '',
        isValid: isValidType && isValidStrike && isValidExpiration
    };
}; 