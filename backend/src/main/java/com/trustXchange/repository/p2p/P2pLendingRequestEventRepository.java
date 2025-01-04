package com.trustXchange.repository.p2p;

import com.trustXchange.entities.p2p.P2pLendingRequestEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface P2pLendingRequestEventRepository  extends JpaRepository<P2pLendingRequestEvent, String> {

}