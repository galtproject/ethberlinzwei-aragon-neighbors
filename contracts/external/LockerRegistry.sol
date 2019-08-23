pragma solidity 0.4.24;

import "./ArraySet.sol";
import "./SpaceLocker.sol";


contract LockerRegistry {
  using ArraySet for ArraySet.AddressSet;

  struct Details {
    bool active;
    address factory;
  }

  event AddLocker(address indexed locker, address indexed owner, address factory);

  // Locker address => Details
  mapping(address => Details) public lockers;

  address public _lockerFactory;

  constructor (address _lockerFactory) public {
    _lockerFactory = _lockerFactory;
  }

  modifier onlyFactory() {
    require(msg.sender == _lockerFactory, "Only factory allowed");

    _;
  }

  function addLocker(address _locker) external onlyFactory {
    Details storage locker = lockers[_locker];

    locker.active = true;
    locker.factory = msg.sender;

    emit AddLocker(_locker, SpaceLocker(_locker).owner(), locker.factory);
  }

  // REQUIRES

  function requireValidLocker(address _locker) external view {
    require(lockers[_locker].active, "Locker address is invalid");
  }

  function isValid(address _locker) external view returns (bool) {
    return lockers[_locker].active;
  }
}
