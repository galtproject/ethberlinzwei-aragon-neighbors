pragma solidity 0.4.24;

import "./IDao.sol";


interface ISpaceLocker  {
  function deposit() external;
  function withdraw(uint256 _spaceTokenId) external;
  function approveMint(IDao _dao) external;
  function isMinted(address _dao) external returns (bool);
  function getDaos() external returns (address[] memory);
  function getDaoCount() external returns (uint256);
  function isOwner() external view returns (bool);
  function getOwner() external view returns(address);
  function getTokenInfo()
    external
    view
    returns (
      address _owner,
      uint256 _spaceTokenId,
      uint256 _reputation,
      bool _tokenDeposited
    );
}
