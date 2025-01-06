package com.trustXchange;

import com.trustXchange.gateway.evm.call.ContractService;
import com.trustXchange.gateway.evm.call.GmpUtil;
import com.trustXchange.gateway.xrpl.XrpService;

public class App {
    public static void main(String[] args) {
        XrpService service = new XrpService();
        service.init();
        //EnvConfig envConfig = new EnvConfig();
        //String privateKey = envConfig.dotenv().get("PRIVATE_KEY");
        //System.out.println(privateKey);
        //ContractService service = new ContractService();
        //MPInputs inputs = GmpUtil.getPocMockInputs(202);
        //service.approveContractCallWithMint(inputs.getInputData());
        //System.out.println(inputs.getInputData());
    }
    
}
