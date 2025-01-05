package com.trustXchange.service;

import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

import com.trustXchange.entities.block.BlockExamed;
import com.trustXchange.repository.block.BlockExamedRepo;
import com.trustXchange.service.common.EventManager;
import com.trustXchange.service.common.EventManagerRegistry;
import com.trustXchange.service.option.OptionEventManagerRegistry;
import com.trustXchange.service.p2p.P2PEventManagerRegistry;
import com.trustXchange.service.pledge.PledgeEventManagerRegistry;

import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.EthLog;
import org.web3j.protocol.core.methods.response.Log;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import java.math.BigInteger;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

@Component
public class EventListener {
    @Autowired
    private P2PEventManagerRegistry p2pEventManagerRegistry;
    @Autowired
    private PledgeEventManagerRegistry pledgeEventManagerRegistry;
    @Autowired
    private OptionEventManagerRegistry optionEventManagerRegistry;
    @Autowired
    private BlockExamedRepo blockExamedRepo;


    private static final Logger logger = LoggerFactory.getLogger(EventListener.class);
    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
    private static final String RPC_URL = "https://rpc-evm-sidechain.xrpl.org";
    private static final String P2P_CONTRACT_ADDRESS = "0x99006642Dc5F79eBeF9dCAf3e95bd7DA0452C58E";
    private static final String PLEDGE_CONTRACT_ADDRESS = "0x83ABF2594aEDf109E2fD83C94FA23b5d9E38340e";
    private static final String OPTION_CONTRACT_ADDRESS = "0x82189dEeeC0310fd147f2423093f4B1F8F95BFc8";

    @PostConstruct
    public void listenFor()  {
        //executorService.scheduleAtFixedRate(() -> manageEventForContract(pledgeEventManagerRegistry,PLEDGE_CONTRACT_ADDRESS, "pledge"), 0, 1, TimeUnit.SECONDS);
        //executorService.scheduleAtFixedRate(() -> manageEventForContract(p2pEventManagerRegistry,P2P_CONTRACT_ADDRESS,"p2p"), 0, 1, TimeUnit.SECONDS);
        //executorService.scheduleAtFixedRate(() -> manageEventForContract(optionEventManagerRegistry,OPTION_CONTRACT_ADDRESS,"option"), 0, 1, TimeUnit.SECONDS);
        }

    private void manageEventForContract(EventManagerRegistry eventManagerRegistry,String contractAddress, String contractName) {
                try{
            logger.info("EventListener called");
            Web3j web3j = Web3j.build(new HttpService(RPC_URL));

            long latestBlock = web3j.ethBlockNumber().send().getBlockNumber().longValue();
            Optional<BlockExamed> blockExamed = blockExamedRepo.findById(contractName);
            BlockExamed blockExamedEntity = blockExamed.orElse(new BlockExamed(contractName, latestBlock - 3000));
            long fromBlock = blockExamedEntity.getLastExamedBlockNumber() + 1;
            if (fromBlock > latestBlock) {
                return;
            }
            long toBlock = latestBlock - fromBlock >= 3000 ? fromBlock + 2999 : latestBlock;
            logger.info("fromBlock: " + fromBlock + " toBlock: " + toBlock);
            EthFilter historicFilter = new EthFilter(
                DefaultBlockParameter.valueOf(BigInteger.valueOf(fromBlock)),
                DefaultBlockParameter.valueOf(BigInteger.valueOf(toBlock)),
                contractAddress
            );
            List<EventManager> eventManagers = eventManagerRegistry.getEventManagers();
            EthLog ethLog = web3j.ethGetLogs(historicFilter).send();
            for (EthLog.LogResult<?> logResult : ethLog.getLogs()) {
                Log log = (Log) logResult.get();
                eventManagers.forEach(eventManager -> eventManager.manage(log));
                };

            blockExamedEntity.setLastExamedBlockNumber(toBlock);
            blockExamedRepo.save(blockExamedEntity);
            } catch (Exception e) {
                logger.error("Error in EventListener", e);
            }
    }

     @PreDestroy
    public void stopPrinter() {
        executorService.shutdown();
        logger.info("EventListener stopped");
    }
}