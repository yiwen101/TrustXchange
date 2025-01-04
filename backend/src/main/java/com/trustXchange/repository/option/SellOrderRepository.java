package com.trustXchange.repository.option;

import com.trustXchange.entities.option.SellOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;


import java.util.List;

@Repository
public interface SellOrderRepository extends JpaRepository<SellOrder, Long> {
    List<SellOrder> findByOptionId(Long optionId);

     @Query("SELECT so FROM SellOrder so WHERE so.optionId = :optionId and so.filledAmount < so.amount ORDER BY so.price ASC")
    List<SellOrder> findTop5ByOptionIdOrderByPriceAsc(Long optionId);

    @Query("SELECT so FROM SellOrder so WHERE so.optionId = :optionId and so.sellerAddress = :userAddress ORDER BY so.id DESC")
    List<SellOrder> findByOptionIdAndUserAddressOrderByTimeDesc(Long optionId, String userAddress);
}