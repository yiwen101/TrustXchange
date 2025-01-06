// GmpInfoController.java
package com.trustXchange.controller;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.trustXchange.entities.gmp.GmpInfo;
import com.trustXchange.gateway.evm.GmpManager;
import com.trustXchange.gateway.evm.call.GmpUtil;
import com.trustXchange.repository.gmp.GmpInfoRepository;

import lombok.Getter;
import lombok.Setter;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/gmp-info")
public class GmpInfoController {
    @Autowired
    private  GmpInfoRepository gmpInfoRepository;
    @Autowired
    private  GmpManager gmpManager;

    @PostMapping("/check")
    @ResponseStatus(HttpStatus.OK)
    public CheckGmpInfoResponse checkGmpInfo(@RequestBody CheckGmpInfoRequest request) {
        String payloadHash = GmpUtil.sha3(request.getPayloadString());
        String transactionHash = request.getTransactionHash();
        GmpInfo gmpInfo = gmpInfoRepository.findByTransactionHash(transactionHash);
        if (gmpInfo == null) {
            return new CheckGmpInfoResponse(false, "not found");
        }
        String payloadHashUpper = payloadHash.toUpperCase();
        String gmpInfoPayloadHashUpper = "0X" + gmpInfo.getPayloadHash().toUpperCase();
        if (!payloadHashUpper.equals(gmpInfoPayloadHashUpper)) {
            return new CheckGmpInfoResponse(false, "not match");
        }
        if (gmpInfo.getIsProcessed()) {
            return new CheckGmpInfoResponse(true, "already processed");
        }
        if (gmpInfo.getIsProcessing()) {
            return new CheckGmpInfoResponse(true, "processing");
        }
        gmpInfo.setIsProcessing(true);
        gmpInfoRepository.save(gmpInfo);
        gmpManager.manage(gmpInfo, request.getPayloadString());
        return new CheckGmpInfoResponse(true, "processing");
    }
}

@Getter
@Setter
class CheckGmpInfoRequest {
    private String payloadString;
    private String transactionHash;
}

class CheckGmpInfoResponse {
    public boolean success;
    public String message;

    public CheckGmpInfoResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}