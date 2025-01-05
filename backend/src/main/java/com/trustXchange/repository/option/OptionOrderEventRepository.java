package com.trustXchange.repository.option;

import com.trustXchange.entities.option.OptionOrderEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionOrderEventRepository  extends JpaRepository<OptionOrderEvent, Long> {

    List<OptionOrderEvent> findByOptionIdOrderByCreatedAtDesc(Long optionId);
    @Query("SELECT oe FROM OptionOrderEvent oe WHERE oe.optionId = :optionId AND oe.posterAddress = :posterAddress ORDER BY oe.createdAt DESC")
    List<OptionOrderEvent> findByOptionIdAndPosterAddress(Long optionId, String posterAddress);
}