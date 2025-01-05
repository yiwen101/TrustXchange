package com.trustXchange.service.option;

import java.sql.Timestamp;

import org.apache.commons.lang3.text.translate.NumericEntityUnescaper.OPTION;

import com.trustXchange.entities.option.OptionType;

public class OptionContractMeta {
    public static final int TYPE_SELL_CALL = 1;
    public static final int TYPE_BUY_CALL = 2;
    public static final int TYPE_SELL_PUT = 3;
    public static final int TYPE_BUY_PUT = 4;
    public static final int EACH_HAND = 100;
    public static final Timestamp START_TIMESTAMP = new Timestamp(1704508800000L);
    public static final int WEEK_IN_SECONDS = 7 * 24 * 60 * 60;
    public static final String SUPPORTED_SOURCE_CHAIN = "XRPL_testnet";
    public static Timestamp getExpiryDate(Long expiryWeeks) {
        return new Timestamp(expiryWeeks * WEEK_IN_SECONDS * 1000 + START_TIMESTAMP.getTime());
    }
    public OptionType getOptionType(int orderType) {
        if (orderType == TYPE_SELL_CALL || orderType == TYPE_BUY_CALL) {
            return OptionType.CALL;
        } else {
            return OptionType.PUT;
        }
    }
}
