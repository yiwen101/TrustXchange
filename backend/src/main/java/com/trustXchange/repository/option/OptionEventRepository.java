package com.trustXchange.repository.option;

import com.trustXchange.entities.option.OptionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

@Repository
public interface OptionEventRepository extends JpaRepository<OptionEvent, Long> {
    // You can add custom query methods here if needed
    List<OptionEvent> findByOptionId(Long optionId);

    @Query("SELECT oe FROM OptionEvent oe WHERE oe.optionId = :optionId AND oe.address = :address")
    List<OptionEvent> findByOptionIdAndUserAddress(Long optionId, String address);
}