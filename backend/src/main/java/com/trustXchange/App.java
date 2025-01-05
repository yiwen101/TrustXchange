package com.trustXchange;

import com.trustXchange.GmpUtil.GMPInputs;

public class App {
    public static void main(String[] args) {
        ContractService service = new ContractService();
        GMPInputs inputs = GmpUtil.getPocMockInputs(202);
        service.approveContractCallWithMint(inputs.getInputData());
        //System.out.println(inputs.getInputData());
    }
    
}
