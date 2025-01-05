package com.trustXchange.repository.option;

import com.trustXchange.entities.option.OptionEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionEventRepository  extends JpaRepository<OptionEvent, Long> {
    List<OptionEvent> findByOptionIdAndUserAddress(Long optionId, String userAddress);
}