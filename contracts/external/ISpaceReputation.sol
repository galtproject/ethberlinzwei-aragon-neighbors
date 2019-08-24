pragma solidity ^0.4.24;


contract ISpaceReputation {
  // ERC721 (SpaceToken) tokenId => area (reputation)
  function balanceOf(uint256 _tokenId) external view returns (uint256);
}
