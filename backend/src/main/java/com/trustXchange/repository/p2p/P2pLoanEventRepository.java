package com.trustXchange.repository.p2p;

import com.trustXchange.entities.p2p.P2pLoanEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface P2pLoanEventRepository  extends JpaRepository<P2pLoanEvent, String> {

}