package com.trustXchange.repository.gmp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.trustXchange.entities.gmp.GmpInfo;

@Repository
public interface GmpInfoRepository extends JpaRepository<GmpInfo, String> {
    GmpInfo findByTransactionHash(String transactionHash);
}