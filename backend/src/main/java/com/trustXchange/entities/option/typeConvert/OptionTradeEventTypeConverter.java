// OptionTradeEventTypeConverter.java
package com.trustXchange.entities.option.typeConvert;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.trustXchange.entities.option.type.OptionTradeEventType;

@Converter(autoApply = true)
public class OptionTradeEventTypeConverter implements AttributeConverter<OptionTradeEventType, String> {

    @Override
    public String convertToDatabaseColumn(OptionTradeEventType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name().toLowerCase();
    }

    @Override
    public OptionTradeEventType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return OptionTradeEventType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Unknown value: " + dbData, e);
        }
    }
}