// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import { AxelarExecutableWithToken } from '../common/abstract/AxelarExecutableWithToken.sol';
import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';

contract OptionsTrading is AxelarExecutableWithToken {
    // with token
    bytes32 public constant BUY_CALL_OPTION = keccak256("buyCallOption");
    bytes32 public constant BUY_PUT_OPTION = keccak256("buyPutOption");
    bytes32 public constant ISSUE_CALL_OPTION = keccak256("issueCallOption");
    bytes32 public constant ISSUE_PUT_OPTION = keccak256("issuePutOption");
    bytes32 public constant EXERCISE_CALL_OPTION = keccak256("exerciseCallOption");
    bytes32 public constant EXERCISE_PUT_OPTION = keccak256("exercisePutOption");

    // without token
    bytes32 public constant SELL_CALL_OPTION = keccak256("sellCallOption");
    bytes32 public constant SELL_PUT_OPTION = keccak256("sellPutOption");
    bytes32 public constant CANCEL_SELL_CALL_OPTION_ORDER = keccak256("cancelSellCallOptionOrder");
    bytes32 public constant CANCEL_SELL_PUT_OPTION_ORDER = keccak256("cancelSellPutOptionOrder");
    bytes32 public constant CANCEL_BUY_CALL_OPTION_ORDER = keccak256("cancelBuyCallOptionOrder");
    bytes32 public constant CANCEL_BUY_PUT_OPTION_ORDER = keccak256("cancelBuyPutOptionOrder");
    bytes32 public constant WITHDRAW_CALL_OPTION_COLLATERAL = keccak256("withdrawCallOptionCollateral");
    bytes32 public constant WITHDRAW_PUT_OPTION_COLLATERAL = keccak256("withdrawPutOptionCollateral");

    
    // for managing orders
    struct OrderInfo {
        uint256 prev;
        address posterAddress;
        uint256 price;
        uint256 amount;
        uint256 strikePrice;
        uint256 expiryDate;
        int orderType;
        uint256 next;
    }

    int orderCounter;
    int TYPE_SELL_CALL;
    int TYPE_BUY_CALL;
    int TYPE_SELL_PUT;
    int TYPE_BUY_PUT;
    mapping(uint256 => SellCallOptionInfo) public orders;
    mapping(uint256 => mapping(uint256 => uint256)) public CallOptionSellOrderChainHead;
    mapping(uint256 => mapping(uint256 => uint256)) public CallOptionBuyOrderChainHead;
    mapping(uint256 => mapping(uint256 => uint256)) public PutOptionSellOrderChainHead;
    mapping(uint256 => mapping(uint256 => uint256)) public PutOptionBuyOrderChainHead;

    // for managing options
    
    // address => strickPrice => expiryDate => amount
    mapping(string => mapping(uint256 => mapping(uint256 => uint256))) public callOptionIssuers;
    mapping(string => mapping(uint256 => mapping(uint256 => uint256))) public putOptionIssuers;
    mapping(string => mapping(uint256 => mapping(uint256 => uint256))) public callOptionOwners;
    mapping(string => mapping(uint256 => mapping(uint256 => uint256))) public putOptionOwners;
    
    // strickPrice => expiryDate => amount
    mapping(uint256 => mapping(uint256 => uint256)) totalCallIssued;
    mapping(uint256 => mapping(uint256 => uint256)) totalCallExercised;
    mapping(uint256 => mapping(uint256 => uint256)) totalPutIssued;
    mapping(uint256 => mapping(uint256 => uint256)) totalPutExercised;


    constructor(address gateway_, address priceOracle_) AxelarExecutable(gateway_) {
        init();
    }

    // gatewat functions
    function _execute(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload
    ) internal override {
        require(keccak256(bytes(sourceChain)) == SUPPORTED_SOURCE_CHAIN_HASH, "Invalid source chain");

        string memory command;
        bytes memory params;
        (command, params) = abi.decode(payload, (string, bytes));
        bytes32 commandHash = keccak256(bytes(command));
        if (commandHash == SELL_CALL_OPTION) {
            (uint256 strikePrice, uint256 expiryDate, uint256 price, uint256 amount) = abi.decode(params, (string, uint256, uint256, uint256, uint256));
            sellCallOption(sourceAddress, strikePrice, expiryDate, price, amount);
        } else if (commandHash == SELL_PUT_OPTION) {
            (uint256 strikePrice, uint256 expiryDate, uint256 price, uint256 amount) = abi.decode(params, (string, uint256, uint256, uint256, uint256));
            sellPutOption(sourceAddress, strikePrice, expiryDate, price, amount);
        } else if (commandHash == CANCEL_SELL_CALL_OPTION_ORDER) {
            (uint256 orderId) = abi.decode(params, (uint256));
            cancelSellCallOptionOrder(sourceAddress, orderId);
        } else if (commandHash == CANCEL_SELL_PUT_OPTION_ORDER) {
            (uint256 orderId) = abi.decode(params, (uint256));
            cancelSellPutOptionOrder(sourceAddress, orderId);
        } else if (commandHash == CANCEL_BUY_CALL_OPTION_ORDER) {
            (uint256 orderId) = abi.decode(params, (uint256));
            cancelBuyCallOptionOrder(sourceAddress, orderId);
        } else if (commandHash == CANCEL_BUY_PUT_OPTION_ORDER) {
            (uint256 orderId) = abi.decode(params, (uint256));
            cancelBuyPutOptionOrder(sourceAddress, orderId);
        } else if (commandHash == WITHDRAW_CALL_OPTION_COLLATERAL) {
            (uint256 strikePrice, uint256 expiryDate) = abi.decode(params, (string, uint256, uint256, uint256, uint256));
            withdrawCallOptionCollateral(sourceChain, sourceAddress, strikePrice, expiryDate);
        } else if (commandHash == WITHDRAW_PUT_OPTION_COLLATERAL) {
            (uint256 strikePrice, uint256 expiryDate) = abi.decode(params, (string, uint256, uint256, uint256, uint256));
            withdrawPutOptionCollateral(sourceChain, sourceAddress, strikePrice, expiryDate);
        }
    }

    function _executeWithToken(
        bytes32 commandId,
        string calldata sourceChain,
        string calldata sourceAddress,
        bytes calldata payload,
        string calldata tokenSymbol,
        uint256 amount
    ) internal override {
        require(amount > 0, "Invalid amount");
        require(keccak256(bytes(sourceChain)) == SUPPORTED_SOURCE_CHAIN_HASH, "Invalid source chain");

        string memory command;
        bytes memory params;
        (command, params) = abi.decode(payload, (string, bytes));
        bytes32 commandHash = keccak256(abi.encodePacked(command));
        if (commandHash == BUY_CALL_OPTION) {
            (uint256 strikePrice, uint256 expiryDate, uint256 price, uint256 amount) = abi.decode(params, (string, string, uint256, uint256, uint256, uint256, uint256));
            buyCallOption(sourceAddress, tokenSymbol, amount, strikePrice, expiryDate, price, amount);
        } else if (commandHash == BUY_PUT_OPTION) {
            (uint256 strikePrice, uint256 expiryDate, uint256 price, uint256 amount) = abi.decode(params, (string, string, uint256, uint256, uint256, uint256));
            buyPutOption(sourceAddress, tokenSymbol, amount, strikePrice, expiryDate, price, amount);
        } else if (commandHash == ISSUE_CALL_OPTION) {
            (uint256 strikePrice, uint256 expiryDate) = abi.decode(params, (string, uint256, uint256, uint256, uint256));
            issueCallOption(sourceAddress, tokenSymbol, amount, strikePrice, expiryDate);
        } else if (commandHash == ISSUE_PUT_OPTION) {
            (uint256 strikePrice, uint256 expiryDate) = abi.decode(params, (string, uint256, uint256, uint256, uint256));
            issuePutOption(sourceAddress, tokenSymbol, amount, strikePrice, expiryDate);
        } else if (commandHash == EXERCISE_CALL_OPTION) {
            (uint256 strikePrice, uint256 expiryDate) = abi.decode(params, (string, uint256, uint256, uint256, uint256));
            exerciseCallOption(sourceChain, sourceAddress, tokenSymbol, amount, strikePrice, expiryDate);
        } else if (commandHash == EXERCISE_PUT_OPTION) {
            (uint256 strikePrice, uint256 expiryDate) = abi.decode(params, (string, uint256, uint256, uint256, uint256));
            exercisePutOption(sourceChain, sourceAddress, tokenSymbol, amount, strikePrice, expiryDate);
        }
    }


    // trade functions
     /*
        request：
        validate;
        <block the amount of call options>
        add to order list (maintain sorted)
        match orders
    */
    function sellCallOption(
        string calldata posterAddress,
        uint256 strikePrice,
        uint256 expiryDate,
        uint256 price,
        uint256 amount
    ) internal {
        require(callOptionOwners[posterAddress][strikePrice][expiryDate] >= amount, "Not enough call options owned");
        callOptionOwners[posterAddress][strikePrice][expiryDate] -= amount;
        uint256 newId = _createOrder(posterAddress, strikePrice, expiryDate, price, amount, TYPE_SELL_CALL);
        _addOrderToChain(newId, CallOptionSellOrderChainHead, true);
        matchCallOptionOrders(strikePrice, expiryDate);
    }


    function sellPutOption(
        string calldata posterAddress,
        uint256 strikePrice,
        uint256 expiryDate,
        uint256 price,
        uint256 amount
    ) internal {
        require(putOptionOwners[posterAddress][strikePrice][expiryDate] >= amount, "Not enough put options owned");
        putOptionOwners[posterAddress][strikePrice][expiryDate] -= amount;
        uint256 newId = _createOrder(posterAddress, strikePrice, expiryDate, price, amount, TYPE_SELL_PUT);
        _addOrderToChain(newId, PutOptionSellOrderChainHead, true);
        matchPutOptionOrders(strikePrice, expiryDate);
    }

    function buyCallOption(
        string calldata buyerAddress,
        string calldata symbol,
        uint256 transferedAmount,
        uint256 strikePrice,
        uint256 expiryDate,
        uint256 price,
        uint256 amount
    ) internal {
        require(keccak256(bytes(symbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(transferedAmount >= price * amount, "Not enough USD to buy call options");
        uint256 newId = _createOrder(buyerAddress, strikePrice, expiryDate, price, amount, TYPE_BUY_CALL);
        _addOrderToChain(newId, CallOptionBuyOrderChainHead, false);
        matchCallOptionOrders(strikePrice, expiryDate);
    }

    function buyPutOption(
        string calldata buyerAddress,
        string calldata symbol,
        uint256 transferedAmount,
        uint256 strikePrice,
        uint256 expiryDate,
        uint256 price,
        uint256 amount
    ) internal {
        require(keccak256(bytes(symbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(transferedAmount >= price * amount, "Not enough USD to buy put options");
        uint256 newId = _createOrder(buyerAddress, strikePrice, expiryDate, price, amount, TYPE_BUY_PUT);
        _addOrderToChain(newId, PutOptionBuyOrderChainHead, false);
        matchPutOptionOrders(strikePrice, expiryDate);
    }

    function cancelSellCallOptionOrder(
        string calldata posterAddress,
        uint256 orderId
    ) internal {
        OrderInfo storage order = sellOptions[orderId];
        require(order.posterAddress == posterAddress, "Not the owner of the order");
        require(order.orderType == TYPE_SELL_CALL, "Not a sell call option order");
        uint256 unfilledAmount = _removeFromSortedList(order, CallOptionSellOrderChainHead);
        callOptionOwners[posterAddress][order.strikePrice][order.expiryDate] += unfilledAmount;
    }

    function cancelSellPutOptionOrder(
        string calldata posterAddress,
        uint256 orderId
    ) internal {
        OrderInfo storage order = sellOptions[orderId];
        require(order.posterAddress == posterAddress, "Not the owner of the order");
        require(order.orderType == TYPE_SELL_PUT, "Not a sell put option order");
        uint256 unfilledAmount = _removeFromSortedList(order, PutOptionSellOrderChainHead);
        putOptionOwners[posterAddress][order.strikePrice][order.expiryDate] += unfilledAmount;
    }

    function cancelBuyCallOptionOrder(
        string calldata buyerAddress,
        uint256 orderId
    ) internal {
        OrderInfo storage order = sellOptions[orderId];
        require(order.posterAddress == buyerAddress, "Not the owner of the order");
        require(order.orderType == TYPE_BUY_CALL, "Not a buy call option order");
        _removeFromSortedList(order, CallOptionBuyOrderChainHead);
    }

    function cancelBuyPutOptionOrder(
        string calldata buyerAddress,
        uint256 orderId
    ) internal {
        OrderInfo storage order = sellOptions[orderId];
        require(order.posterAddress == buyerAddress, "Not the owner of the order");
        require(order.orderType == TYPE_BUY_PUT, "Not a buy put option order");
        _removeFromSortedList(order, PutOptionBuyOrderChainHead);
    }


    // issue, exercise, withdraw
    function issueCallOption(
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 xrp_transfered,
        uint256 strikePrice,
        uint256 expiryDate
    ) internal nonReentrant {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("XRP")), "Invalid token symbol");
        require(xrp_transfered > 0, "Amount must be positive");
        require(xrp_transfered % 100 == 0, "Amount must be multiple of 100");
        require(strikePrice > 0, "Strike price must be positive");
        require(expiryDate > block.timestamp, "Expiry must be in future");

        callOptionOwners[sourceAddress][strikePrice][expiryDate] += xrp_transfered;
        callOptionIssuers[sourceAddress][strikePrice][expiryDate] += xrp_transfered;
        totalCallIssued[strikePrice][expiryDate] += xrp_transfered;
    }

    function issuePutOption (
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 usd_collateral,
        uint256 strikePrice,
        uint256 expiryDate
    ) internal nonReentrant {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(usd_collateral > 0, "Amount must be positive");
        require(usd_collateral % (100 * strikePrice) == 0, "Collateral must match option size");
        require(strikePrice > 0, "Strike price must be positive");
        require(expiryDate > block.timestamp, "Expiry must be in future");

        uint256 optionAmount = usd_collateral / strikePrice;
        putOptionOwners[sourceAddress][strikePrice][expiryDate] += optionAmount;
        putOptionIssuers[sourceAddress][strikePrice][expiryDate] += optionAmount;
        totalPutIssued[strikePrice][expiryDate] += optionAmount;
    }

    function exerciseCallOption(
        string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 usd_transfered,
        uint256 strikePrice,
        uint256 expiryDate
    ) internal payable nonReentrant {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(usd_transfered > 0, "Amount must be positive");
        require(strikePrice > 0, "Strike price must be positive");
        require(expiryDate > block.timestamp, "Option not expired");

        uint256 amountOwned = callOptionOwners[sourceAddress][strikePrice][expiryDate];
        uint256 amountAsked = usd_transfered / strikePrice;
        if (amountAsked > amountOwned) {
            amountAsked = amountOwned;
        }

        gateway.sendToken(sourceChain, sourceAddress, "XRP", amountAsked);
        callOptionOwners[sourceAddress][strikePrice][expiryDate] -= amountAsked;
        totalCallExercised[strikePrice][expiryDate] += amountAsked;
    }


    function exercisePutOption(
        string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 xrp_transfered,
        uint256 strikePrice,
        uint256 expiryDate
    ) internal payable nonReentrant {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("XRP")), "Invalid token symbol");
        require(xrp_transfered > 0, "Amount must be positive");
        require(xrp_transfered % 100 == 0, "Amount must be multiple of 100");
        require(strikePrice > 0, "Strike price must be positive");
        require(expiryDate > block.timestamp, "Option not expired");

        uint256 amountOwned = putOptionOwners[sourceAddress][strikePrice][expiryDate];
        if (xrp_transfered > amountOwned) {
            xrp_transfered = amountOwned;
        }

        uint256 usdAmount = xrp_transfered * strikePrice;
        gateway.sendToken(sourceChain, sourceAddress, "USD", usdAmount);
        putOptionOwners[sourceAddress][strikePrice][expiryDate] -= xrp_transfered;
        totalPutExercised[strikePrice][expiryDate] += xrp_transfered;
    }

    function withdrawCallOptionCollateral(
        string calldata sourceChain,
        string calldata sourceAddress,
        uint256 strikePrice,
        uint256 expiryDate
    ) internal nonReentrant {
        require(expiryDate <= block.timestamp, "Option not expired");
        uint256 amountOwned = callOptionIssuers[sourceAddress][strikePrice][expiryDate];
        require(amountOwned > 0, "No call options issued");
        uint256 totalIssued = totalCallIssued[strikePrice][expiryDate];
        uint256 totalExercised = totalCallExercised[strikePrice][expiryDate];
        _handleWithdrawal(sourceChain, sourceAddress, amountOwned, totalIssued, totalExercised);
        callOptionIssuers[sourceAddress][strikePrice][expiryDate] = 0;
    }

    function withdrawPutOptionCollateral(
        string calldata sourceChain,
        string calldata sourceAddress,
        uint256 strikePrice,
        uint256 expiryDate
    ) internal nonReentrant {
        require(expiryDate <= block.timestamp, "Option not expired");
        uint256 amountOwned = putOptionIssuers[sourceAddress][strikePrice][expiryDate];
        require(amountOwned > 0, "No put options issued");
        uint256 totalIssued = totalPutIssued[strikePrice][expiryDate];
        uint256 totalExercised = totalPutExercised[strikePrice][expiryDate];
        _handleWithdrawal(sourceChain, sourceAddress, amountOwned, totalIssued, totalExercised);
        putOptionIssuers[sourceAddress][strikePrice][expiryDate] = 0;
    }

    // common functions
    function _createOrder(
        string calldata posterAddress,
        uint256 strikePrice,
        uint256 expiryDate,
        uint256 price,
        uint256 amount,
        int orderType
    ) internal returns (uint256) {
        require(price > minUnsignedInt256, "Price must be positive");
        require(amount > 0, "Amount must be positive");
        require(amount % 100 == 0, "Amount must be multiple of 100");

        uint256 newId = ++orderCount;
        OrderInfo memory newOrder = OrderInfo({
            prev: -1,
            posterAddress: posterAddress,
            price: price,
            amount: amount,
            orderType: orderType,
            strikePrice: strikePrice,
            expiryDate: expiryDate,
            next: -1
        });
        orders[newId] = newOrder;

        return newId;
    }


    function _addOrderToChain (
        uint256 newId,
        mapping(uint256 => mapping(uint256 => uint256)) storage listHeadMap,
        bool increasing
    ) internal {
        // trick: if not init and the chain prioritise smaller price, set the head to MAX_ORDER,otherwise set to MIN_ORDER,so that inserted ones will never be the end to simplify the logic
        uint256 headId = listHeadMap[strikePrice][expiryDate];
        if (headId == 0) {
            listHeadMap[strikePrice][expiryDate] = increase ? MAX_ORDER_INDEX :  MIN_ORDER_INDEX;
        }

        // travesal to find the node that should be the next of the new node
        uint256 currentId = headId;
        while (orders[currentId].next != -1) {
            if (increasing && orders[currentId].price > price) {
                break;
            } 
            if (!increasing && sellOptions[currentId].price < price) {
                break;
            }
            currentId = uint256(sellOptions[currentId].next);
        }
        
        // insert the new node in the front of currentId
        orders[newId].prev = orders[currentId].prev;
        orders[newId].next = currentId;
        orders[currentId].prev = newId;
        if (orders[newId].prev != -1) {
            orders[uint256(orders[newId].prev)].next = newId;
        } else {
            listHeadMap[strikePrice][expiryDate] = newId;
        }
    }

    function  _removeFromSortedList(
        OrderInfo storage order,
        mapping(uint256 => mapping(uint256 => uint256)) storage listHeadMap
    )  internal returns (uint256) {
        uint256 strikePrice = order.strikePrice;
        uint256 expiryDate = order.expiryDate;
        if (order.prev == -1) {
            listHeadMap[strikePrice][expiryDate] = uint256(order.next);
        } else {
            sellOptions[uint256(order.prev)].next = order.next;
        }

        if (order.next != -1) {
            sellOptions[uint256(order.next)].prev = order.prev;
        }
        return order.amount;
    }

    function _matchOrders(
        uint256 strikePrice,
        uint256 expiryDate,
        mapping(uint256 => mapping(uint256 => uint256)) storage sellOrderChainHead,
        mapping(uint256 => mapping(uint256 => uint256)) storage buyOrderChainHead
    ) {
        uint256 sellId = sellOrderChainHead[strikePrice][expiryDate];
        uint256 buyId = buyOrderChainHead[strikePrice][expiryDate];
        OrderInfo storage sellOrder = orders[sellId];
        OrderInfo storage buyOrder = orders[buyId];
        while (sellOrder.price <= buyOrder.price) {
                uint256 amount = sellOrder.amount < buyOrder.amount ? sellOrder.amount : buyOrder.amount;
                uint256 priceDiff = buyOrder.price - sellOrder.price;
                gateway.sendToken(sellOrder.posterAddress, "USD", sellOrder.price * amount);
                sellOrder.amount -= amount;
                buyOrder.amount -= amount;
                callOptionOwners[sellOrder.posterAddress][strikePrice][expiryDate] -= amount;
                callOptionOwners[buyOrder.posterAddress][strikePrice][expiryDate] += amount;
                gateway.sendToken(buyOrder.posterAddress, "USD", priceDiff * amount);
                if (sellOrder.amount == 0) {
                    sellId = sellOrder.next;
                    sellOrder = orders[sellId];
                }
                if (buyOrder.amount == 0) {
                    buyId = buyOrder.next;
                    buyOrder = orders[buyId];
                }
        }
        sellOrderChainHead[strikePrice][expiryDate] = sellId;
        buyOrderChainHead[strikePrice][expiryDate] = buyId;
    }

    function _matchCallOptionOrders(
        uint256 strikePrice,
        uint256 expiryDate
    ) internal {
        _matchOrders(strikePrice, expiryDate, CallOptionSellOrderChainHead, CallOptionBuyOrderChainHead);
    }

    function matchPutOptionOrders(
        uint256 strikePrice,
        uint256 expiryDate
    ) internal {
        _matchOrders(strikePrice, expiryDate, PutOptionSellOrderChainHead, PutOptionBuyOrderChainHead);
    }

    function _handleWithdrawal(
        string calldata sourceChain,
        string calldata sourceAddress,
        uint256 amountOwned,
        uint256 totalIssued,
        uint256 totalExercised
    ) internal {
        // if less than 20 percent of the options are exercised, assume not profitable to exercise, withdraw XRP
        if(totalExercised * 4 < totalIssued) {
            gateway.sendToken(sourceChain, sourceAddress, "XRP", amountOwned);

        // if more than 80 percent of the options are  exercised, assume profitable to exercise, withdraw USD
        } else if (totalExercised * 5 > totalIssued * 4) {
            uint256 usdAmount = amountOwned * strikePrice;
            gateway.sendToken(sourceChain, sourceAddress, "USD", usdAmount);

        // else assume half half (this should be rare); as amount owned is multiple of 100, no need to worry about rounding
        } else {
            uint256 usdAmount = amountOwned * strikePrice / 2;
            gateway.sendToken(sourceChain, sourceAddress, "USD", usdAmount);
            gateway.sendToken(sourceChain, sourceAddress, "XRP", amountOwned/2);
        }
    }


    // init 
     function init() internal {
        uint256 maxUnsignedInt256 = (2**255 - 1) * 2 + 1;
        uint256 minUnsignedInt256 = 0;
        MIN_ORDER_INDEX = 1;
        MAX_ORDER_INDEX = 2;

        orders[MIN_ORDER_INDEX] = OrderInfo({
        prev: -1,
        sellerAddress: address(1),
        price: minUnsignedInt256 ,
        amount: 999,
        next: -1
        });

        orders[MAX_ORDER_INDEX ] = OrderInfo({
            prev: -1,
            sellerAddress: address(1),
            price: maxUnsignedInt256,
            amount: 999,
            next: -1
        });

        orderCounter = 3;

        TYPE_SELL_CALL = 1;
        TYPE_BUY_CALL = 2;
        TYPE_SELL_PUT = 3;
        TYPE_BUY_PUT = 4;
    }
}