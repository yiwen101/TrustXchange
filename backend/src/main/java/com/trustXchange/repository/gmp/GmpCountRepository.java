package com.trustXchange.repository.gmp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.trustXchange.entities.gmp.GmpCount;

@Repository
public interface GmpCountRepository extends JpaRepository<GmpCount, String> {
    GmpCount findByName(String name);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE gmp_count SET count = count + 1 WHERE name = :name RETURNING count", nativeQuery = true)
    Long incrementAndGetCountByName(@Param("name") String name);
}