package com.trustXchange.repository.option;

import com.trustXchange.entities.option.TradeEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Date;

@Repository
public interface TradeEventRepository extends JpaRepository<TradeEvent, Long> {
    // You can add custom query methods here if needed
    List<TradeEvent> findByOptionId(Long optionId);

     @Query("SELECT te FROM TradeEvent te WHERE te.optionId = :optionId AND te.buyerAddress = :address or te.sellerAddress =:address")
    List<TradeEvent> findByOptionIdAndUserAddress(Long optionId, String address);

    @Query("SELECT te FROM TradeEvent te WHERE te.optionId = :optionId AND te.dealPrice >= :startTime")
    List<TradeEvent> findByOptionIdAndDealPriceAfter(Long optionId, Date startTime);

     @Query("SELECT te FROM TradeEvent te WHERE te.optionId = :optionId ORDER BY te.id DESC")
    List<TradeEvent> findByOptionIdOrderByTimeDesc(Long optionId);


}