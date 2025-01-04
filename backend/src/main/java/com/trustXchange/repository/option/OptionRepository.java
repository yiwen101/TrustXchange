package com.trustXchange.repository.option;

import com.trustXchange.entities.option.Option;

import java.sql.Timestamp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface OptionRepository  extends JpaRepository<Option, Long> {
    @Query("SELECT o FROM Option o WHERE o.optionType = :optionType AND o.strikePrice = :strikePrice AND o.expiryDate = :expiryDate")
    <Optional> Option findByOptionTypeAndStrikePriceAndExpiryDate(String optionType, Long strikePrice, Timestamp expiryDate); 
}