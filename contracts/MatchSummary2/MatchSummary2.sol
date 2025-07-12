// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MatchSummary2 {
    event MatchCommitted(
        uint256 indexed date,
        string location,
        string summaryJson
    );

    function commitSummary(
        uint256 date,
        string calldata location,
        string calldata summaryJson
    ) external {
        emit MatchCommitted(date, location, summaryJson);
    }
}
