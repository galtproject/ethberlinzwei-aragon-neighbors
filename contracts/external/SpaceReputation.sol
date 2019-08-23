pragma solidity ^0.4.24;


contract SpaceReputation {
  // ERC721 (SpaceToken) tokenId => area (reputation)
  mapping(uint256 => uint256) internal area;

  function balanceOf(uint256 _tokenId) external view returns (uint256) {
    return area[_tokenId];
  }
}
