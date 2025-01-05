package com.trustXchange.repository.option;

import com.trustXchange.entities.option.OptionOrder;
import com.trustXchange.entities.option.OptionOrderType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionOrderRepository  extends JpaRepository<OptionOrder, Long> {

    List<OptionOrder> findTop5ByOptionIdAndFilledAmountLessThanAndOrderTypeOrderByPriceDesc(Long optionId, Long totalAmount, OptionOrderType optionOrderType, Pageable pageable);

    //   findTop5ByOptionIdAndFilledAmountLessThanOrderByPriceDesc

}