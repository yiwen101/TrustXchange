package com.trustXchange.repository.block;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.trustXchange.entities.block.BlockExamed;

@Repository
public interface BlockExamedRepo  extends JpaRepository<BlockExamed, Integer> {
    @Query("SELECT be FROM BlockExamed be WHERE be.contractName = :contractName")
    Optional<BlockExamed> findByContractName(String contractName);
}
