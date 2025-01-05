// OptionTypeConverter.java
package com.trustXchange.entities.option.typeConvert;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.trustXchange.entities.option.type.OptionType;

@Converter(autoApply = true)
public class OptionTypeConverter implements AttributeConverter<OptionType, String> {

    @Override
    public String convertToDatabaseColumn(OptionType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name().toLowerCase();
    }

    @Override
    public OptionType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return OptionType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Unknown value: " + dbData, e);
        }
    }
}