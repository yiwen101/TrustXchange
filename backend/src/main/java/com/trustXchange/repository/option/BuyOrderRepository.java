package com.trustXchange.repository.option;

import com.trustXchange.entities.option.BuyOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


@Repository
public interface BuyOrderRepository extends JpaRepository<BuyOrder, Long> {
        List<BuyOrder> findByOptionId(Long optionId);

        @Query("SELECT bo FROM BuyOrder bo WHERE bo.optionId = :optionId and bo.filledAmount < bo.amount ORDER BY bo.price DESC")
      List<BuyOrder> findTop5ByOptionIdOrderByPriceDesc(Long optionId);

      @Query("SELECT bo FROM BuyOrder bo WHERE bo.optionId = :optionId and bo.buyerAddress = :userAddress ORDER BY bo.id DESC")
      List<BuyOrder> findByOptionIdAndUserAddressOrderByTimeDesc(Long optionId, String userAddress);
}