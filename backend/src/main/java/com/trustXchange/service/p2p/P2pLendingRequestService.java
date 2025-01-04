package com.trustXchange.service.p2p;

import com.trustXchange.entities.p2p.P2pLendingRequest;
import com.trustXchange.entities.p2p.P2pLoan;
import com.trustXchange.repository.p2p.P2pLendingRequestRepository;
import com.trustXchange.repository.p2p.P2pLoanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class P2pLendingRequestService {

    @Autowired
    private P2pLendingRequestRepository p2pLendingRequestRepository;
    @Autowired
    private P2pLoanRepository p2pLoanRepository;

    public Optional<P2pLendingRequest> getLendingRequestById(Integer id) {
        return p2pLendingRequestRepository.findById(id);
    }

    public List<P2pLendingRequest> getLendingRequestsByLender(String lender) {
        return p2pLendingRequestRepository.findByLender(lender);
    }

    public List<P2pLendingRequest> getAllLendingRequests() {
        return p2pLendingRequestRepository.findAll();
    }

    public List<P2pLoan> getFullLoansByLendingRequestId(Integer requestId) {
        return p2pLoanRepository.findAll().stream()
           .filter(loan -> p2pLendingRequestRepository.findById(requestId).isPresent() &&
              loan.getLender().equals(p2pLendingRequestRepository.findById(requestId).get().getLender()))
            .collect(Collectors.toList());
    }
}