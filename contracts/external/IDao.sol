pragma solidity 0.4.24;

interface IDao {
  // ERC20 compatible
  function balanceOf(address owner) external view returns (uint256);

  // ERC20 compatible
  function totalSupply() external view returns (uint256);

  // Ping-Pong Handshake
  function ping() external pure returns (bytes32);
}
