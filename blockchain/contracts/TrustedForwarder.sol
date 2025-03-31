// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/metatx/ERC2771Forwarder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
//import "hardhat/console.sol";

contract TrustedForwarder is Ownable, ERC2771Forwarder {
    IERC20 public feeToken; // The ERC-20 token in which fees are collected
    uint256 public gasConversionRate; // Fee markup in percentage for the gas used
    uint256 public minFeeTokenAmount; // Minimal fee in token

    mapping(address => uint256) public tokenFees; // Track ERC-20 token fees

    event Forwarded(address indexed to, uint256 gasUsed, uint256 feeTokenAmount);
    event ForwarderFeeUpdated(uint256 rate, uint256 minFeeAmount);
    event ForwarderFeesWithdrawn(address indexed token, uint256 amount);

    constructor(address _feeToken) Ownable(msg.sender) ERC2771Forwarder('TrustedForwarder') {
        feeToken = IERC20(_feeToken); // ERC-20 token used for collecting fees
        gasConversionRate = 1;
        minFeeTokenAmount = 0;
    }

    // Setter function to update the feeToken address
    function setFeeToken(address newFeeToken) public onlyOwner {
        require(newFeeToken != address(0), "Invalid address");
        feeToken = IERC20(newFeeToken);
    }

    // Function to set gas-based fee (percentage markup and minimum fee in token)
    function setFee(uint256 newGasConversionRate, uint256 newMinFeeTokenAmount) public onlyOwner {
        gasConversionRate = newGasConversionRate;
        minFeeTokenAmount = newMinFeeTokenAmount;

        emit ForwarderFeeUpdated(newGasConversionRate, newMinFeeTokenAmount);
    }

    // Withdraw the collected ERC-20 token fees
    function withdrawFees() public onlyOwner {
        uint256 amount = tokenFees[address(feeToken)];
        require(amount > 0, "No token fees to withdraw");

        tokenFees[address(feeToken)] = 0;
        feeToken.transfer(msg.sender, amount); // Transfer tokens to the owner

        emit ForwarderFeesWithdrawn(address(feeToken), amount);
    }

    // Function to calculate the fee in ERC-20 tokens based on gas used
    function _calculateFeeTokenAmount(uint256 gasUsed) internal view returns (uint256) {
        uint256 gasCostInWei = gasUsed * tx.gasprice; // Calculate the gas cost in ETH (wei)
        uint256 feeTokenAmount = (gasCostInWei * gasConversionRate);

        // Ensure the fee is at least the minimum fee in tokens
        if (feeTokenAmount < minFeeTokenAmount) {
            feeTokenAmount = minFeeTokenAmount;
        }

        return feeTokenAmount;
    }
}
