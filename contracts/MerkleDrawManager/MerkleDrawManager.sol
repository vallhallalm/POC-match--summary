// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleDrawManager {
    struct Draw {
        bytes32 merkleRoot;
        uint256 drawBlockNumber;
        bytes32 seed;
        bool seedGenerated;
    }

    mapping(uint256 => Draw) public draws;

    event DrawCreated(uint256 indexed drawId, bytes32 merkleRoot, uint256 drawBlockNumber);
    event SeedGenerated(uint256 indexed drawId, bytes32 seed);

    /// @notice Create a new draw with its Merkle root and future block number
    function createDraw(uint256 drawId, bytes32 merkleRoot, uint256 drawBlockNumber) external {
        require(draws[drawId].merkleRoot == 0, "Draw already exists");
        require(drawBlockNumber > block.number, "Draw block must be in the future");

        draws[drawId] = Draw({
            merkleRoot: merkleRoot,
            drawBlockNumber: drawBlockNumber,
            seed: 0,
            seedGenerated: false
        });

        emit DrawCreated(drawId, merkleRoot, drawBlockNumber);
    }

    /// @notice Generate the seed from the predefined blockhash
    function generateSeed(uint256 drawId) external {
        Draw storage draw = draws[drawId];
        require(draw.merkleRoot != 0, "Draw does not exist");
        require(!draw.seedGenerated, "Seed already generated");
        require(block.number > draw.drawBlockNumber, "Draw block not reached");

        bytes32 bh = blockhash(draw.drawBlockNumber);
        require(bh != 0, "Blockhash not available");

        draw.seed = keccak256(abi.encodePacked(bh, drawId));
        draw.seedGenerated = true;

        emit SeedGenerated(drawId, draw.seed);
    }

    /// @notice Get the winning index
    function getWinnerIndex(uint256 drawId, uint256 totalParticipants) public view returns (uint256) {
        Draw storage draw = draws[drawId];
        require(draw.seedGenerated, "Seed not generated yet");
        require(totalParticipants > 0, "No participants");

        return uint256(draw.seed) % totalParticipants;
    }

    /// @notice Verify if an address is the winner using its index and Merkle proof
    function verifyWinner(
        uint256 drawId,
        uint256 totalParticipants,
        uint256 leafIndex,
        address user,
        bytes32[] calldata proof
    ) external view returns (bool) {
        Draw storage draw = draws[drawId];
        require(draw.seedGenerated, "Seed not generated");

        // Recompute the leaf
        bytes32 leaf = keccak256(abi.encodePacked(leafIndex, user));

        // Verify Merkle proof
        bool validProof = MerkleProof.verifyCalldata(proof, draw.merkleRoot, leaf);
        if (!validProof) return false;

        // Check if leafIndex is the winner
        uint256 winnerIndex = uint256(draw.seed) % totalParticipants;
        return (leafIndex == winnerIndex);
    }
}
