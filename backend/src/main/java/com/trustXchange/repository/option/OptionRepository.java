package com.trustXchange.repository.option;

import com.trustXchange.entities.option.Option;
import com.trustXchange.entities.option.OptionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.Optional;

@Repository
public interface OptionRepository  extends JpaRepository<Option, Long> {

    Optional<Option> findByOptionTypeAndStrikePriceAndExpiryDate(OptionType optionType, Long strikePrice, Timestamp expiryDate);
}