pragma solidity ^0.4.24;

import "./ISpaceReputation.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";


contract SpaceReputation is ISpaceReputation, Ownable {
  // ERC721 (SpaceToken) tokenId => area (reputation)
  mapping(uint256 => uint256) internal areas;
  // ERC721 (SpaceToken) tokenId => contour(goehash[])
  mapping(uint256 => bytes32[]) internal contours;

  function setArea(uint256 _tokenId, uint256 _area) external onlyOwner {
    areas[_tokenId] = _area;
  }

  function setContour(uint256 _tokenId, bytes32[] _contour) external onlyOwner {
    contours[_tokenId] = _contour;
  }

  function getContourOf(uint256 _tokenId) external view returns (bytes32[]) {
    return contours[_tokenId];
  }

  function balanceOf(uint256 _tokenId) external view returns (uint256) {
    return areas[_tokenId];
  }
}
