package com.trustXchange.repository.option;

import com.trustXchange.entities.option.UserOptionBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface UserOptionBalanceRepository extends JpaRepository<UserOptionBalance, Long> {
    // You can add custom query methods here if needed
    Optional<UserOptionBalance> findByOptionIdAndUserAddress(Long optionId, String userAddress);
    List<UserOptionBalance> findByOptionId(Long optionId);
}