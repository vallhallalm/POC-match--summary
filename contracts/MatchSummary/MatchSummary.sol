// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MatchSummary {
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
