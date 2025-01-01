package com.trustXchange.repository;

import com.trustXchange.entity.P2PLendingRequestFilledEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface P2PLendingRequestFilledRepository extends JpaRepository<P2PLendingRequestFilledEntity, Integer> {
    List<P2PLendingRequestFilledEntity> findAllByRequestId(int requestId);

}