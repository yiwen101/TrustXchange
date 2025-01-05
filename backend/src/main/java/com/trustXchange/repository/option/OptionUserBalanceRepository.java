package com.trustXchange.repository.option;

import com.trustXchange.entities.option.OptionUserBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OptionUserBalanceRepository  extends JpaRepository<OptionUserBalance, Long> {

    Optional<OptionUserBalance> findByOptionIdAndUserAddress(Long optionId, String userAddress);
}