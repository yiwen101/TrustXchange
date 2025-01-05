// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { AxelarExecutableWithToken } from '../common/abstract/AxelarExecutableWithToken.sol';
import { IMyAxelarGateway } from '../common/interfaces/IMyAxelarGateway.sol';

contract OptionTrading is AxelarExecutableWithToken {
    // --- Constants for Command Identifiers ---
    bytes32 public constant BUY_CALL_OPTION = keccak256("buyCallOption");
    bytes32 public constant BUY_PUT_OPTION = keccak256("buyPutOption");
    bytes32 public constant ISSUE_CALL_OPTION = keccak256("issueCallOption");
    bytes32 public constant ISSUE_PUT_OPTION = keccak256("issuePutOption");
    bytes32 public constant EXERCISE_CALL_OPTION = keccak256("exerciseCallOption");
    bytes32 public constant EXERCISE_PUT_OPTION = keccak256("exercisePutOption");

    bytes32 public constant SELL_CALL_OPTION = keccak256("sellCallOption");
    bytes32 public constant SELL_PUT_OPTION = keccak256("sellPutOption");
    bytes32 public constant CANCEL_SELL_CALL_OPTION_ORDER = keccak256("cancelSellCallOptionOrder");
    bytes32 public constant CANCEL_SELL_PUT_OPTION_ORDER = keccak256("cancelSellPutOptionOrder");
    bytes32 public constant CANCEL_BUY_CALL_OPTION_ORDER = keccak256("cancelBuyCallOptionOrder");
    bytes32 public constant CANCEL_BUY_PUT_OPTION_ORDER = keccak256("cancelBuyPutOptionOrder");
    bytes32 public constant WITHDRAW_CALL_OPTION_COLLATERAL = keccak256("withdrawCallOptionCollateral");
    bytes32 public constant WITHDRAW_PUT_OPTION_COLLATERAL = keccak256("withdrawPutOptionCollateral");

    // --- Constants for Time Conversion ---
    uint256 public constant START_TIMESTAMP = 1704508800; // Timestamp of 2024-01-06 00:00:00 UTC
    uint256 public constant SECONDS_IN_WEEK = 7 * 24 * 60 * 60;
    string public constant supportedSourceChain = "XRPL_testnet";
    bytes32 public constant SUPPORTED_SOURCE_CHAIN_HASH = keccak256(bytes(supportedSourceChain));

    // --- Data Structures ---
    struct OrderInfo {
        uint256 prev;
        string posterAddress;
        uint256 price;
        uint256 amount;
        uint256 strikePrice;
        uint256 expiryWeeks; // Changed from expiryDate
        int orderType;
        uint256 next;
    }

    int public orderCounter;
    int public TYPE_SELL_CALL;
    int public TYPE_BUY_CALL;
    int public TYPE_SELL_PUT;
    int public TYPE_BUY_PUT;
    uint256 public MIN_ORDER_INDEX;
    uint256 public MAX_ORDER_INDEX;
     uint256 public orderCount;

    mapping(uint256 => OrderInfo) public orders; // Changed to OrderInfo storage type
    mapping(uint256 => mapping(uint256 => uint256)) public CallOptionOptionOrderChainHead;
    mapping(uint256 => mapping(uint256 => uint256)) public CallOptionOptionOrderChainHead;
    mapping(uint256 => mapping(uint256 => uint256)) public PutOptionOptionOrderChainHead;
    mapping(uint256 => mapping(uint256 => uint256)) public PutOptionOptionOrderChainHead;

    // address => strickPrice => expiryWeeks => amount
    mapping(string => mapping(uint256 => mapping(uint256 => uint256))) public callOptionIssuers;
    mapping(string => mapping(uint256 => mapping(uint256 => uint256))) public putOptionIssuers;
    mapping(string => mapping(uint256 => mapping(uint256 => uint256))) public callOptionOwners;
    mapping(string => mapping(uint256 => mapping(uint256 => uint256))) public putOptionOwners;

    // strickPrice => expiryWeeks => amount
    mapping(uint256 => mapping(uint256 => uint256)) totalCallIssued;
    mapping(uint256 => mapping(uint256 => uint256)) totalCallExercised;
    mapping(uint256 => mapping(uint256 => uint256)) totalPutIssued;
    mapping(uint256 => mapping(uint256 => uint256)) totalPutExercised;
    
     // --- Events for Backend ---
    event OptionIssued(
        string sourceAddress,
        uint256 strikePrice,
        uint256 expiryWeeks,
        uint256 amount,
        bool isCall
    );

    event OptionExercised(
        string sourceAddress,
         uint256 strikePrice,
        uint256 expiryWeeks,
        uint256 amount,
         bool isCall
    );

    event OptionOrderPlaced(
        uint256 orderId,
        string posterAddress,
        uint256 strikePrice,
        uint256 expiryWeeks,
        uint256 price,
        uint256 amount,
        int orderType
    );

    event OptionOrderCancelled(
        uint256 orderId,
        string posterAddress,
        uint256 strikePrice,
        uint256 expiryWeeks,
        uint256 amount,
        int orderType
    );
     event OptionTradeExecuted(
        string buyerAddress,
        string sellerAddress,
        uint256 optionId,
        uint256 strikePrice,
        uint256 expiryWeeks,
        uint256 price,
        uint256 amount,
        uint256 OptionOrderId,
        uint256 OptionOrderId
     );

    event OptionCollateralWithdrawn(
        string sourceAddress,
         uint256 strikePrice,
        uint256 expiryWeeks,
         uint256 amount,
         bool isCall
    );


    constructor(address gateway_) AxelarExecutableWithToken(gateway_) {
        init();
    }

     function _getExpiryTimestamp(uint256 expiryWeeks) internal view returns (uint256) {
        return START_TIMESTAMP + (expiryWeeks * SECONDS_IN_WEEK);
    }

    function _isOptionExpired(uint256 expiryWeeks) internal view returns (bool) {
        return block.timestamp >= _getExpiryTimestamp(expiryWeeks);
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
            (uint256 strikePrice, uint256 expiryWeeks, uint256 price, uint256 amount) = abi.decode(params, (uint256, uint256, uint256, uint256));
            sellCallOption(sourceAddress, strikePrice, expiryWeeks, price, amount);
        } else if (commandHash == SELL_PUT_OPTION) {
            (uint256 strikePrice, uint256 expiryWeeks, uint256 price, uint256 amount) = abi.decode(params, (uint256, uint256, uint256, uint256));
            sellPutOption(sourceAddress, strikePrice, expiryWeeks, price, amount);
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
            (uint256 strikePrice, uint256 expiryWeeks) = abi.decode(params, (uint256, uint256));
            withdrawCallOptionCollateral(sourceChain, sourceAddress, strikePrice, expiryWeeks);
        } else if (commandHash == WITHDRAW_PUT_OPTION_COLLATERAL) {
            (uint256 strikePrice, uint256 expiryWeeks) = abi.decode(params, (uint256, uint256));
            withdrawPutOptionCollateral(sourceChain, sourceAddress, strikePrice, expiryWeeks);
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
            (uint256 strikePrice, uint256 expiryWeeks, uint256 price, uint256 _amount) = abi.decode(params, (uint256, uint256, uint256, uint256));
            buyCallOption(sourceAddress, tokenSymbol, amount, strikePrice, expiryWeeks, price, _amount);
        } else if (commandHash == BUY_PUT_OPTION) {
            (uint256 strikePrice, uint256 expiryWeeks, uint256 price, uint256 _amount) = abi.decode(params, (uint256, uint256, uint256, uint256));
            buyPutOption(sourceAddress, tokenSymbol, amount, strikePrice, expiryWeeks, price, _amount);
        } else if (commandHash == ISSUE_CALL_OPTION) {
            (uint256 strikePrice, uint256 expiryWeeks) = abi.decode(params, (uint256, uint256));
            issueCallOption(sourceAddress, tokenSymbol, amount, strikePrice, expiryWeeks);
        } else if (commandHash == ISSUE_PUT_OPTION) {
           (uint256 strikePrice, uint256 expiryWeeks) = abi.decode(params, (uint256, uint256));
            issuePutOption(sourceAddress, tokenSymbol, amount, strikePrice, expiryWeeks);
        } else if (commandHash == EXERCISE_CALL_OPTION) {
            (uint256 strikePrice, uint256 expiryWeeks) = abi.decode(params, (uint256, uint256));
            exerciseCallOption(sourceChain, sourceAddress, tokenSymbol, amount, strikePrice, expiryWeeks);
        } else if (commandHash == EXERCISE_PUT_OPTION) {
            (uint256 strikePrice, uint256 expiryWeeks) = abi.decode(params, (uint256, uint256));
            exercisePutOption(sourceChain, sourceAddress, tokenSymbol, amount, strikePrice, expiryWeeks);
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
        uint256 expiryWeeks,
        uint256 price,
        uint256 amount
    ) internal {
        require(callOptionOwners[posterAddress][strikePrice][expiryWeeks] >= amount, "Not enough call options owned");
        callOptionOwners[posterAddress][strikePrice][expiryWeeks] -= amount;
        uint256 newId = _createOrder(posterAddress, strikePrice, expiryWeeks, price, amount, TYPE_SELL_CALL);
        _addOrderToChain(newId, CallOptionOptionOrderChainHead, true);
       
        emit OptionOrderPlaced(newId, posterAddress, strikePrice, expiryWeeks, price, amount, TYPE_SELL_CALL);
        _matchCallOptionOrders(strikePrice, expiryWeeks);
    }

    function sellPutOption(
        string calldata posterAddress,
        uint256 strikePrice,
        uint256 expiryWeeks,
        uint256 price,
        uint256 amount
    ) internal {
        require(putOptionOwners[posterAddress][strikePrice][expiryWeeks] >= amount, "Not enough put options owned");
        putOptionOwners[posterAddress][strikePrice][expiryWeeks] -= amount;
        uint256 newId = _createOrder(posterAddress, strikePrice, expiryWeeks, price, amount, TYPE_SELL_PUT);
        _addOrderToChain(newId, PutOptionOptionOrderChainHead, true);

        emit OptionOrderPlaced(newId, posterAddress, strikePrice, expiryWeeks, price, amount, TYPE_SELL_PUT);
        _matchPutOptionOrders(strikePrice, expiryWeeks);
    }

    function buyCallOption(
        string calldata buyerAddress,
        string calldata symbol,
        uint256 transferedAmount,
        uint256 strikePrice,
        uint256 expiryWeeks,
        uint256 price,
        uint256 amount
    ) internal {
        require(keccak256(bytes(symbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(transferedAmount >= price * amount, "Not enough USD to buy call options");
        uint256 newId = _createOrder(buyerAddress, strikePrice, expiryWeeks, price, amount, TYPE_BUY_CALL);
        _addOrderToChain(newId, CallOptionOptionOrderChainHead, false);

       emit OptionOrderPlaced(newId, buyerAddress, strikePrice, expiryWeeks, price, amount, TYPE_BUY_CALL);
        _matchCallOptionOrders(strikePrice, expiryWeeks);
    }

    function buyPutOption(
        string calldata buyerAddress,
        string calldata symbol,
        uint256 transferedAmount,
        uint256 strikePrice,
        uint256 expiryWeeks,
        uint256 price,
        uint256 amount
    ) internal {
        require(keccak256(bytes(symbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(transferedAmount >= price * amount, "Not enough USD to buy put options");
         uint256 newId = _createOrder(buyerAddress, strikePrice, expiryWeeks, price, amount, TYPE_BUY_PUT);
        _addOrderToChain(newId, PutOptionOptionOrderChainHead, false);

         emit OptionOrderPlaced(newId, buyerAddress, strikePrice, expiryWeeks, price, amount, TYPE_BUY_PUT);
        _matchPutOptionOrders(strikePrice, expiryWeeks);
    }

    function cancelSellCallOptionOrder(
        string calldata posterAddress,
        uint256 orderId
    ) internal {
        OrderInfo storage order = orders[orderId];
        require(keccak256(bytes(order.posterAddress)) == keccak256(bytes(posterAddress)), "Not the owner of the order");
        require(order.orderType == TYPE_SELL_CALL, "Not a sell call option order");
        uint256 unfilledAmount = _removeFromSortedList(order, CallOptionOptionOrderChainHead);
         emit OptionOrderCancelled(orderId, posterAddress, order.strikePrice, order.expiryWeeks, unfilledAmount, TYPE_SELL_CALL);
         callOptionOwners[posterAddress][order.strikePrice][order.expiryWeeks] += unfilledAmount;
    }

    function cancelSellPutOptionOrder(
        string calldata posterAddress,
        uint256 orderId
    ) internal {
        OrderInfo storage order = orders[orderId];
        require(keccak256(bytes(order.posterAddress)) == keccak256(bytes(posterAddress)), "Not the owner of the order");
        require(order.orderType == TYPE_SELL_PUT, "Not a sell put option order");
        uint256 unfilledAmount = _removeFromSortedList(order, PutOptionOptionOrderChainHead);
         emit OptionOrderCancelled(orderId, posterAddress, order.strikePrice, order.expiryWeeks, unfilledAmount, TYPE_SELL_PUT);
         putOptionOwners[posterAddress][order.strikePrice][order.expiryWeeks] += unfilledAmount;
    }

    function cancelBuyCallOptionOrder(
        string calldata buyerAddress,
        uint256 orderId
    ) internal {
         OrderInfo storage order = orders[orderId];
        require(keccak256(bytes(order.posterAddress)) == keccak256(bytes(buyerAddress)), "Not the owner of the order");
        require(order.orderType == TYPE_BUY_CALL, "Not a buy call option order");
          uint256 unfilledAmount = _removeFromSortedList(order, CallOptionOptionOrderChainHead);
            emit OptionOrderCancelled(orderId, buyerAddress, order.strikePrice, order.expiryWeeks, unfilledAmount, TYPE_BUY_CALL);
    }

    function cancelBuyPutOptionOrder(
        string calldata buyerAddress,
        uint256 orderId
    ) internal {
         OrderInfo storage order = orders[orderId];
        require(keccak256(bytes(order.posterAddress)) == keccak256(bytes(buyerAddress)), "Not the owner of the order");
        require(order.orderType == TYPE_BUY_PUT, "Not a buy put option order");
         uint256 unfilledAmount = _removeFromSortedList(order, PutOptionOptionOrderChainHead);
        emit OptionOrderCancelled(orderId, buyerAddress, order.strikePrice, order.expiryWeeks, unfilledAmount, TYPE_BUY_PUT);
    }

    // issue, exercise, withdraw
    function issueCallOption(
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 xrp_transfered,
        uint256 strikePrice,
        uint256 expiryWeeks
    ) internal {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("XRP")), "Invalid token symbol");
        require(xrp_transfered > 0, "Amount must be positive");
        require(xrp_transfered % 100 == 0, "Amount must be multiple of 100");
        require(strikePrice > 0, "Strike price must be positive");
        require(!_isOptionExpired(expiryWeeks), "Expiry must be in future");

        callOptionOwners[sourceAddress][strikePrice][expiryWeeks] += xrp_transfered;
        callOptionIssuers[sourceAddress][strikePrice][expiryWeeks] += xrp_transfered;
        totalCallIssued[strikePrice][expiryWeeks] += xrp_transfered;

        emit OptionIssued(sourceAddress, strikePrice, expiryWeeks, xrp_transfered, true);
    }

    function issuePutOption (
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 usd_collateral,
        uint256 strikePrice,
         uint256 expiryWeeks
    ) internal  {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(usd_collateral > 0, "Amount must be positive");
        require(usd_collateral % (100 * strikePrice) == 0, "Collateral must match option size");
        require(strikePrice > 0, "Strike price must be positive");
        require(!_isOptionExpired(expiryWeeks), "Expiry must be in future");

        uint256 optionAmount = usd_collateral / strikePrice;
        putOptionOwners[sourceAddress][strikePrice][expiryWeeks] += optionAmount;
        putOptionIssuers[sourceAddress][strikePrice][expiryWeeks] += optionAmount;
         totalPutIssued[strikePrice][expiryWeeks] += optionAmount;

        emit OptionIssued(sourceAddress, strikePrice, expiryWeeks, optionAmount, false);
    }

    function exerciseCallOption(
        string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 usd_transfered,
        uint256 strikePrice,
         uint256 expiryWeeks
    ) internal   {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("USD")), "Invalid token symbol");
        require(usd_transfered > 0, "Amount must be positive");
        require(strikePrice > 0, "Strike price must be positive");
        require(!_isOptionExpired(expiryWeeks), "Option not expired");

        uint256 amountOwned = callOptionOwners[sourceAddress][strikePrice][expiryWeeks];
        uint256 amountAsked = usd_transfered / strikePrice;
        if (amountAsked > amountOwned) {
            amountAsked = amountOwned;
        }

        gateway().sendToken(sourceChain, sourceAddress, "XRP", amountAsked);
        callOptionOwners[sourceAddress][strikePrice][expiryWeeks] -= amountAsked;
         totalCallExercised[strikePrice][expiryWeeks] += amountAsked;

        emit OptionExercised(sourceAddress, strikePrice, expiryWeeks, amountAsked, true);
    }

    function exercisePutOption(
        string calldata sourceChain,
        string calldata sourceAddress,
        string calldata tokenSymbol,
        uint256 xrp_transfered,
        uint256 strikePrice,
        uint256 expiryWeeks
    ) internal  {
        require(keccak256(bytes(tokenSymbol)) == keccak256(bytes("XRP")), "Invalid token symbol");
        require(xrp_transfered > 0, "Amount must be positive");
        require(xrp_transfered % 100 == 0, "Amount must be multiple of 100");
        require(strikePrice > 0, "Strike price must be positive");
        require(!_isOptionExpired(expiryWeeks), "Option not expired");

        uint256 amountOwned = putOptionOwners[sourceAddress][strikePrice][expiryWeeks];
        if (xrp_transfered > amountOwned) {
            xrp_transfered = amountOwned;
        }

        uint256 usdAmount = xrp_transfered * strikePrice;
        gateway().sendToken(sourceChain, sourceAddress, "USD", usdAmount);
        putOptionOwners[sourceAddress][strikePrice][expiryWeeks] -= xrp_transfered;
         totalPutExercised[strikePrice][expiryWeeks] += xrp_transfered;
        
        emit OptionExercised(sourceAddress, strikePrice, expiryWeeks, xrp_transfered, false);
    }

    function withdrawCallOptionCollateral(
        string calldata sourceChain,
        string calldata sourceAddress,
        uint256 strikePrice,
        uint256 expiryWeeks
    ) internal  {
        require(_isOptionExpired(expiryWeeks), "Option not expired");
        uint256 amountOwned = callOptionIssuers[sourceAddress][strikePrice][expiryWeeks];
        require(amountOwned > 0, "No call options issued");
        uint256 totalIssued = totalCallIssued[strikePrice][expiryWeeks];
        uint256 totalExercised = totalCallExercised[strikePrice][expiryWeeks];
        _handleWithdrawal(sourceChain, sourceAddress, amountOwned, totalIssued, totalExercised, strikePrice);
         callOptionIssuers[sourceAddress][strikePrice][expiryWeeks] = 0;
          emit OptionCollateralWithdrawn(sourceAddress, strikePrice, expiryWeeks, amountOwned, true);
    }

    function withdrawPutOptionCollateral(
        string calldata sourceChain,
        string calldata sourceAddress,
        uint256 strikePrice,
         uint256 expiryWeeks
    ) internal  {
        require(_isOptionExpired(expiryWeeks), "Option not expired");
        uint256 amountOwned = putOptionIssuers[sourceAddress][strikePrice][expiryWeeks];
        require(amountOwned > 0, "No put options issued");
        uint256 totalIssued = totalPutIssued[strikePrice][expiryWeeks];
        uint256 totalExercised = totalPutExercised[strikePrice][expiryWeeks];
         _handleWithdrawal(sourceChain, sourceAddress, amountOwned, totalIssued, totalExercised, strikePrice);
        putOptionIssuers[sourceAddress][strikePrice][expiryWeeks] = 0;
         emit OptionCollateralWithdrawn(sourceAddress, strikePrice, expiryWeeks, amountOwned, false);
    }

    // common functions
    function _createOrder(
        string calldata posterAddress,
        uint256 strikePrice,
         uint256 expiryWeeks,
        uint256 price,
        uint256 amount,
        int orderType
    ) internal returns (uint256) {
        require(price > 0, "Price must be positive");
        require(price < 999999999999, "Price must be less than 999999999999");
        require(amount > 0, "Amount must be positive");
        require(amount % 100 == 0, "Amount must be multiple of 100");

        uint256 newId = ++orderCount;
        OrderInfo memory newOrder = OrderInfo({
            prev: 0,
            posterAddress: posterAddress,
            price: price,
            amount: amount,
            orderType: orderType,
            strikePrice: strikePrice,
            expiryWeeks: expiryWeeks,
            next: 0
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
        uint256 strikePrice = orders[newId].strikePrice;
         uint256 expiryWeeks = orders[newId].expiryWeeks;
        uint256 price = orders[newId].price;
        uint256 headId = listHeadMap[strikePrice][expiryWeeks];
        if (headId == 0) {
            listHeadMap[strikePrice][expiryWeeks] = increasing ? MAX_ORDER_INDEX :  MIN_ORDER_INDEX;
        }

        // travesal to find the node that should be the next of the new node
        uint256 currentId = headId;
        while (orders[currentId].next != 0) {
             if (increasing && orders[currentId].price > price) {
                break;
            }
            if (!increasing && orders[currentId].price < price) {
                break;
            }
            currentId = orders[currentId].next;
        }

        // insert the new node in the front of currentId
        orders[newId].prev = orders[currentId].prev;
        orders[newId].next = currentId;
        orders[currentId].prev = newId;
        if (orders[newId].prev != 0) {
           orders[orders[newId].prev].next = newId;
        } else {
            listHeadMap[strikePrice][expiryWeeks] = newId;
        }
    }

    function  _removeFromSortedList(
        OrderInfo storage order,
        mapping(uint256 => mapping(uint256 => uint256)) storage listHeadMap
    )  internal returns (uint256) {

        uint256 strikePrice = order.strikePrice;
        uint256 expiryWeeks = order.expiryWeeks;

        if (order.prev == 0) {
            listHeadMap[strikePrice][expiryWeeks] = order.next;
        } else {
            orders[order.prev].next = order.next;
        }

        if (order.next != 0) {
            orders[order.next].prev = order.prev;
        }
        return order.amount;
    }

    function _matchOrders(
        uint256 strikePrice,
        uint256 expiryWeeks,
        mapping(uint256 => mapping(uint256 => uint256)) storage OptionOrderChainHead,
        mapping(uint256 => mapping(uint256 => uint256)) storage OptionOrderChainHead
    ) private {
        uint256 sellId = OptionOrderChainHead[strikePrice][expiryWeeks];
        uint256 buyId = OptionOrderChainHead[strikePrice][expiryWeeks];
           while (sellId != MAX_ORDER_INDEX && buyId != MAX_ORDER_INDEX) {
              OrderInfo storage OptionOrder = orders[sellId];
            OrderInfo storage OptionOrder = orders[buyId];
              if (OptionOrder.price > OptionOrder.price) {
                 break;
              }
            uint256 amount = OptionOrder.amount < OptionOrder.amount ? OptionOrder.amount : OptionOrder.amount;
            uint256 priceDiff = OptionOrder.price - OptionOrder.price;

            gateway().sendToken(supportedSourceChain, OptionOrder.posterAddress, "USD", OptionOrder.price * amount);
            gateway().sendToken(supportedSourceChain, OptionOrder.posterAddress, "USD", priceDiff * amount);
            OptionOrder.amount -= amount;
            OptionOrder.amount -= amount;
             emit OptionTradeExecuted(OptionOrder.posterAddress, OptionOrder.posterAddress, OptionOrder.strikePrice, strikePrice, expiryWeeks, OptionOrder.price, amount, buyId, sellId);

              if(OptionOrder.amount == 0) {
                _removeFromSortedList(OptionOrder, OptionOrderChainHead);
                 sellId = OptionOrderChainHead[strikePrice][expiryWeeks];
                }

                if(OptionOrder.amount == 0) {
                      _removeFromSortedList(OptionOrder, OptionOrderChainHead);
                      buyId = OptionOrderChainHead[strikePrice][expiryWeeks];
                 }
        }
        OptionOrderChainHead[strikePrice][expiryWeeks] = sellId;
         OptionOrderChainHead[strikePrice][expiryWeeks] = buyId;
    }

    function _matchCallOptionOrders(
        uint256 strikePrice,
        uint256 expiryWeeks
    ) internal {
        _matchOrders(strikePrice, expiryWeeks, CallOptionOptionOrderChainHead, CallOptionOptionOrderChainHead);
    }

    function _matchPutOptionOrders(
        uint256 strikePrice,
        uint256 expiryWeeks
    ) internal {
        _matchOrders(strikePrice, expiryWeeks, PutOptionOptionOrderChainHead, PutOptionOptionOrderChainHead);
    }

    function _handleWithdrawal(
        string calldata sourceChain,
        string calldata sourceAddress,
        uint256 amountOwned,
        uint256 totalIssued,
        uint256 totalExercised,
        uint256 strikePrice
    ) private {
         // if less than 20 percent of the options are exercised, assume not profitable to exercise, withdraw XRP
        if(totalExercised * 4 < totalIssued) {
            gateway().sendToken(sourceChain, sourceAddress, "XRP", amountOwned);

        // if more than 80 percent of the options are  exercised, assume profitable to exercise, withdraw USD
        } else if (totalExercised * 5 > totalIssued * 4) {
            uint256 usdAmount = amountOwned * strikePrice;
            gateway().sendToken(sourceChain, sourceAddress, "USD", usdAmount);

        // else assume half half (this should be rare); as amount owned is multiple of 100, no need to worry about rounding
        } else {
            uint256 usdAmount = amountOwned * strikePrice / 2;
            gateway().sendToken(sourceChain, sourceAddress, "USD", usdAmount);
            gateway().sendToken(sourceChain, sourceAddress, "XRP", amountOwned/2);
        }
    }


    // init
     function init() internal {
        uint256 maxUnsignedInt256 = (2**255 - 1) * 2 + 1;
        uint256 minUnsignedInt256 = 0;
        MIN_ORDER_INDEX = 1;
        MAX_ORDER_INDEX = 2;

        orders[MIN_ORDER_INDEX] = OrderInfo({
        prev: 0,
        posterAddress: "",
        price: minUnsignedInt256 ,
        amount: 999,
        orderType: 0,
        strikePrice: 0,
        expiryWeeks: 0,
        next: 0
        });

        orders[MAX_ORDER_INDEX ] = OrderInfo({
            prev: 0,
            posterAddress: "",
            price: maxUnsignedInt256,
             amount: 999,
             orderType: 0,
             strikePrice: 0,
            expiryWeeks: 0,
            next: 0
        });

        orderCounter = 3;

        TYPE_SELL_CALL = 1;
        TYPE_BUY_CALL = 2;
        TYPE_SELL_PUT = 3;
        TYPE_BUY_PUT = 4;
    }
}