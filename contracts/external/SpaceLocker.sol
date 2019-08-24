pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "./ArraySet.sol";
import "./IDao.sol";
import "./ISpaceReputation.sol";
import "./ISpaceLocker.sol";


contract SpaceLocker is ISpaceLocker {
  using ArraySet for ArraySet.AddressSet;

  event ReputationMint(address indexed dao);
  event ReputationBurn(address indexed dao);
  event Deposit();
  event Withdrawal();

  address public spaceTokenContract;
  address public spaceReputationContract;
  address public owner;

  uint256 public spaceTokenId;
  bool public tokenDeposited;

  ArraySet.AddressSet internal daos;

  // tokenId can't be changed later
  constructor(address _spaceTokenContract, uint256 _tokenId, address _owner) public {
    owner = _owner;
  }

  modifier onlyOwner() {
    require(isOwner(), "Not the locker owner");
    _;
  }

  function deposit() external onlyOwner {
    require(!tokenDeposited, "Token already deposited");

    tokenDeposited = true;

    ERC721Token(spaceTokenContract).transferFrom(msg.sender, address(this), spaceTokenId);

    emit Deposit();
  }

  function withdraw(uint256 _spaceTokenId) external onlyOwner {
    require(tokenDeposited, "Token not deposited");
    require(daos.size() == 0, "DAOs counter should be 0");

    tokenDeposited = false;

    ERC721Token(spaceTokenContract).safeTransferFrom(address(this), msg.sender, _spaceTokenId);

    emit Withdrawal();
  }

  function approveMint(IDao _dao) external onlyOwner {
    require(!daos.has(address(_dao)), "Already minted to this RA");
    require(_dao.ping() == bytes32("pong"), "Handshake failed");

    daos.add(address(_dao));

    emit ReputationMint(address(_dao));
  }

  // TODO: figure out how to burn
//  function burn(IDao _dao) external onlyOwner {
//    require(daos.has(address(_dao)), "Not minted to the RA");
//    require(_dao.balanceOf(msg.sender) == 0, "Reputation not completely burned");
//
//    daos.remove(address(_dao));
//
//    emit ReputationBurn(address(_dao));
//  }

  // GETTERS

  function isMinted(address _dao) external returns (bool) {
    return daos.has(_dao);
  }

  function getDaos() external returns (address[] memory) {
    return daos.elements();
  }

  function getDaoCount() external returns (uint256) {
    return daos.size();
  }

  function isOwner() public view returns (bool) {
    return msg.sender == owner;
  }

  function getOwner() public view returns (address) {
    return owner;
  }

  function getSpaceTokenId() public view returns (uint256) {
    return spaceTokenId;
  }

  function getTokenInfo()
    external
    view
    returns (
      address _owner,
      uint256 _spaceTokenId,
      bool _tokenDeposited
    )
  {
    return (
      owner,
      spaceTokenId,
      tokenDeposited
    );
  }
}
