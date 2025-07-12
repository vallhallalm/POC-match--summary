// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MatchSummary is Initializable {
    event MatchCommitted(
        uint256 indexed date,
        string location,
        address indexed winner
    );

    function commitSummary(
        uint256 date,
        string calldata location,
        address winner
    ) external {
        emit MatchCommitted(date, location, winner);
    }
}
