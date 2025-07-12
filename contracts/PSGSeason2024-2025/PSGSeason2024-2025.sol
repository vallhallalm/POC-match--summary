// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PSGSeason20242025 is ERC1155, Ownable {
    string public name;

    // tokenID => tokenURI
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory _name, address initialOwner) ERC1155("https://example.com/") Ownable(initialOwner) {
        name = _name;
    }

    // Set URI for a specific token ID
    function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
        _tokenURIs[tokenId] = tokenURI;
        emit URI(tokenURI, tokenId);
    }

    // Override the uri() function to return token-specific URI
    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        require(bytes(tokenURI).length > 0, "URI not set for token");
        return tokenURI;
    }

    // Mint function with no URI param, just mint tokens
    function mint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner {
        require(bytes(_tokenURIs[id]).length > 0, "URI must be set before minting");
        _mint(to, id, amount, data);
    }
}
