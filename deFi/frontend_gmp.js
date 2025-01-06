
import * as p2pUtils from "./p2pPayloadUtil.js"


const AMOUNT = "90000000";


const {inputData,executeWithTokenParams} = p2pUtils.getP2PBorrowingRequestGMPParams(203);

const payloadStr = executeWithTokenParams.payload;
// spring-boot
const backendApi = "http://localhost:8080/api/gmp-info/check";
/*
@Getter
@Setter
class CheckGmpInfoRequest {
    private String payloadString;
    private String transactionHash;
}
*/
//const hash =  await gmp("",payloadStr);
// sleep for 10 seconds
await new Promise(resolve => setTimeout(resolve, 10000));
const response = await fetch(backendApi, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        payloadString: payloadStr,
        transactionHash: 'CFC45CAF98E171427672F271FF56D871F1483642649DA77A64C7C4AB1FB54677',
    }),
});
console.log(response);
/*
class CheckGmpInfoResponse {
    public String message;

    public CheckGmpInfoResponse(String message) {
        this.message = message;
    }
}
*/
const data = await response.json();
console.log(data.message);