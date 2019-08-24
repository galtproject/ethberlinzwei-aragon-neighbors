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
  event Deposit(uint256 reputation);
  event Withdrawal(uint256 reputation);

  address public spaceTokenContract;
  address public spaceReputationContract;
  address public owner;

  uint256 public spaceTokenId;
  uint256 public reputation;
  bool public tokenDeposited;

  ArraySet.AddressSet internal daos;

  // tokenId can't be changed later
  constructor(address _spaceTokenContract, address _spaceReputationContract, uint256 _tokenId, address _owner) public {
    owner = _owner;
  }

  modifier onlyOwner() {
    require(isOwner(), "Not the locker owner");
    _;
  }

  function deposit() external onlyOwner {
    require(!tokenDeposited, "Token already deposited");

    reputation = ISpaceReputation(spaceReputationContract).balanceOf(spaceTokenId);
    tokenDeposited = true;

    ERC721Token(spaceTokenContract).transferFrom(msg.sender, address(this), spaceTokenId);

    emit Deposit(reputation);
  }

  function withdraw(uint256 _spaceTokenId) external onlyOwner {
    require(tokenDeposited, "Token not deposited");
    require(daos.size() == 0, "DAOs counter should be 0");

    reputation = 0;
    tokenDeposited = false;

    ERC721Token(spaceTokenContract).safeTransferFrom(address(this), msg.sender, _spaceTokenId);

    emit Withdrawal(reputation);
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

  function getTokenInfo()
    external
    view
    returns (
      address _owner,
      uint256 _spaceTokenId,
      uint256 _reputation,
      bool _tokenDeposited
    )
  {
    return (
      owner,
      spaceTokenId,
      reputation,
      tokenDeposited
    );
  }
}
