// OptionActionTypeConverter.java
package com.trustXchange.entities.option.typeConvert;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

import com.trustXchange.entities.option.type.OptionActionType;

@Converter(autoApply = true)
public class OptionActionTypeConverter implements AttributeConverter<OptionActionType, String> {

    @Override
    public String convertToDatabaseColumn(OptionActionType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.name().toLowerCase();
    }

    @Override
    public OptionActionType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        try {
            return OptionActionType.valueOf(dbData.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Unknown value: " + dbData, e);
        }
    }
}