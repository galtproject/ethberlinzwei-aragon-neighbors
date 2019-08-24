pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./ArraySet.sol";
import "./IDao.sol";
import "./ISpaceReputation.sol";
import "./ISpaceLocker.sol";
import "./ISpaceRegistry.sol";
import "./SpaceLocker.sol";


contract SpaceLockerFactory is Ownable {
  event NewSpaceLocker(address spaceLocker);

  ISpaceRegistry public spaceRegistry;

  function setRegistry(ISpaceRegistry _spaceRegistry) external onlyOwner {
    spaceRegistry = _spaceRegistry;
  }

  function build(address _spaceTokenContract, uint256 _tokenId, address _owner) external returns (SpaceLocker spaceLocker) {
    spaceLocker = new SpaceLocker(_spaceTokenContract, _tokenId, _owner);
    spaceRegistry.addLocker(address(spaceLocker));
    emit NewSpaceLocker(spaceLocker);
  }
}
