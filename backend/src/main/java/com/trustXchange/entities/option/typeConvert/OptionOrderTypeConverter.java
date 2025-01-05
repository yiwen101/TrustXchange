// OptionOrderTypeConverter.java
package com.trustXchange.entities.option.typeConvert;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.trustXchange.entities.option.type.OptionOrderType;

@Converter(autoApply = true)
public class OptionOrderTypeConverter implements AttributeConverter<OptionOrderType, String> {

    @Override
    public String convertToDatabaseColumn(OptionOrderType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name().toLowerCase();
    }

    @Override
    public OptionOrderType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return OptionOrderType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Unknown value: " + dbData, e);
        }
    }
}