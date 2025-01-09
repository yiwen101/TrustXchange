// GmpInfoController.java
package com.trustXchange.controller;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.checkerframework.checker.units.qual.g;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.trustXchange.entities.gmp.GmpInfo;
import com.trustXchange.gateway.evm.GmpManager;
import com.trustXchange.gateway.evm.call.GmpUtil;
import com.trustXchange.repository.gmp.GmpInfoRepository;

import lombok.Getter;
import lombok.Setter;


@RestController
@RequestMapping("api/gmp")
public class GmpInfoController {
    @Autowired
    private  GmpInfoRepository gmpInfoRepository;
    @Autowired
    private  GmpManager gmpManager;

    @PostMapping("/call")
    @ResponseStatus(HttpStatus.OK)
    public CheckGmpInfoResponse checkGmpInfo(@RequestBody CheckGmpInfoRequest request) {
        String payloadHash = GmpUtil.sha3(request.getPayloadString());
        String transactionHash = request.getTransactionHash();
        GmpInfo gmpInfo = gmpInfoRepository.findByTransactionHash(transactionHash);
        if (gmpInfo == null) {
            return new CheckGmpInfoResponse(false);
        }
        String payloadHashUpper = payloadHash.toUpperCase();
        String gmpInfoPayloadHashUpper = "0X" + gmpInfo.getPayloadHash().toUpperCase();
        if (!payloadHashUpper.equals(gmpInfoPayloadHashUpper)) {
            return new CheckGmpInfoResponse(false);
        }
        if (!gmpInfo.getIsReceived()) {
            gmpInfo.setIsReceived(true);
            gmpInfoRepository.save(gmpInfo);
        }
        
        gmpManager.manage(gmpInfo, request.getPayloadString());
        return new CheckGmpInfoResponse(gmpInfo);
    }
}

@Getter
@Setter
class CheckGmpInfoRequest {
    private String payloadString;
    private String transactionHash;
}

class CheckGmpInfoResponse {
    public boolean isReceived;
    public boolean isApproved;
    public boolean isCalled;
    public String getewayTransactionHash;
    public String contractTransactionHash;

    public CheckGmpInfoResponse(GmpInfo gmpInfo) {
        this.isReceived = gmpInfo.getIsReceived();
        this.isApproved = gmpInfo.getIsApproved();
        this.isCalled = gmpInfo.getIsCalled();
        this.getewayTransactionHash = gmpInfo.getGatewayTransactionHash();
        this.contractTransactionHash = gmpInfo.getContractTransactionHash();
    }
    public CheckGmpInfoResponse(boolean isReceived) {
        this.isReceived = isReceived;
    }
}