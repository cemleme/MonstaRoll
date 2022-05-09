//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "hardhat/console.sol";

contract MockVRFCoordinator {
    uint256 internal counter = 0;
    uint256 epoch = 0;
    mapping(uint256 => uint256[]) randoms;
    mapping(uint256 => address) consumers;
    mapping(uint256 => uint256) requestIds;

    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32 numWords
    ) external returns (uint256 requestId) {
        
        requestId = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, counter++))
            );
        for(uint i = 0; i < numWords; i++){
            uint256 randomNumber = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, counter++))
            );
            randoms[epoch].push(randomNumber);
        }
        consumers[epoch] = msg.sender;
        requestIds[epoch] = requestId;
        epoch++;
    }

    function fulfill(uint256 _epoch) external {
        VRFConsumerBaseV2 consumer = VRFConsumerBaseV2(consumers[_epoch]);
        consumer.rawFulfillRandomWords(requestIds[_epoch], randoms[_epoch]);
    }
}