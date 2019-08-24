pragma solidity 0.4.24;

import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
import "./external/ISpaceLocker.sol";
import "./external/ISpaceReputation.sol";
import "./external/ISpaceRegistry.sol";


contract CounterApp is AragonApp {
    using SafeMath for uint256;

    /// Events
    event Increment(address indexed entity, uint256 step);
    event Decrement(address indexed entity, uint256 step);

    /// State
    uint256 public value;
    mapping(uint256 => bool) public approvedSpaceTokens;

    address public spaceTokenContract;
    ISpaceReputation public spaceReputationContract;
    ISpaceRegistry public spaceRegistryContract;

    /// ACL
    bytes32 constant public INCREMENT_ROLE = keccak256("INCREMENT_ROLE");
    bytes32 constant public DECREMENT_ROLE = keccak256("DECREMENT_ROLE");

    function initialize(
        address _spaceTokenContract,
        ISpaceReputation _spaceReputationContract,
        ISpaceRegistry _spaceRegistryContract
    ) public onlyInit {
        initialized();

        spaceTokenContract = _spaceTokenContract;
        spaceRegistryContract = _spaceRegistryContract;
        spaceReputationContract = _spaceReputationContract;
    }

    /**
     * @notice Increment the counter by `step`
     * @param step Amount to increment by
     */
    function increment(uint256 step) external auth(INCREMENT_ROLE) {
        value = value.add(step);
        emit Increment(msg.sender, step);
    }

    function mintReputation(uint256 _tokenId, address _tm, address _receiver) external {
        require(spaceRegistryContract.isValid(_receiver), "Not a valid locker");

        // TODO: check the owner is a receiver
        uint256 reputation = spaceReputationContract.balanceOf(_tokenId);
        require(reputation > 0, "Reputation is 0");

        uint256 erc20balance = TokenManager(_tm).token().balanceOf(_receiver);

        // compare balances
        require(erc20balance == 0, "Balance should be burned first");

        _tm.call(abi.encodeWithSignature("mint", _receiver, reputation));
    }

    /**
     * @notice Decrement the counter by `step`
     * @param step Amount to decrement by
     */
    function decrement(uint256 step) external auth(DECREMENT_ROLE) {
        value = value.sub(step);
        emit Decrement(msg.sender, step);
    }
}
