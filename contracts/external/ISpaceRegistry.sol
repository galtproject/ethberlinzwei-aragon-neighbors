pragma solidity 0.4.24;


contract ISpaceRegistry {
  function addLocker(address _locker) external;
  function requireValidLocker(address _locker) external view;
  function isValid(address _locker) external view returns (bool);
}
