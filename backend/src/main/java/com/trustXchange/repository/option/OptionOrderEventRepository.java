package com.trustXchange.repository.option;

import com.trustXchange.entities.option.OptionOrderEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionOrderEventRepository  extends JpaRepository<OptionOrderEvent, Long> {

    List<OptionOrderEvent> findByOptionIdOrderByCreatedAtDesc(Long optionId);
    List<OptionOrderEvent> findByOptionIdAndUserAddress(Long optionId, String userAddress);
}