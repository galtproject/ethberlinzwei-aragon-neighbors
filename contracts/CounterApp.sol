pragma solidity 0.4.24;

import "@aragon/os/contracts/lib/math/SafeMath.sol";
import "@aragon/os/contracts/apps/AragonApp.sol";
import "@aragon/apps-token-manager/contracts/TokenManager.sol";
//import "@aragon/os/contracts/apm/APMNamehash.sol";
import "./external/ISpaceLocker.sol";
import "./external/ISpaceReputation.sol";
import "./external/ISpaceRegistry.sol";


contract CounterApp is AragonApp
//, APMNamehash 
{
    using SafeMath for uint256;

    /// Events
    event Increment(address indexed entity, uint256 step);
    event Decrement(address indexed entity, uint256 step);

    /// State
    uint256 public value;
    bool public setupDone;
    mapping(uint256 => bool) public approvedSpaceTokens;

    address public spaceTokenContract;
    ISpaceReputation public spaceReputationContract;
    ISpaceRegistry public spaceRegistryContract;
    address tm;

    /// ACL
    bytes32 constant public INCREMENT_ROLE = keccak256("INCREMENT_ROLE");
    bytes32 constant public DECREMENT_ROLE = keccak256("DECREMENT_ROLE");

    function initialize() public onlyInit {
        initialized();
    }

//    function getVotingHash() external view returns (bytes32) {
//        return apmNamehash("voting");
//    }
//
//    function getTokenManagerHash() external view returns (bytes32) {
//        return apmNamehash("token-manager");
//    }

    /**
     * @notice Initial user provides required values
     * @param _spaceTokenContract SpaceToken address
     * @param _spaceReputationContract SpaceReputation address
     * @param _spaceRegistryContract SpaceRegistry address
     * @param _initialLocker Address of an initial locker
     * @param _tm TokenManager address
     */
    function setup(
        address _spaceTokenContract,
        ISpaceReputation _spaceReputationContract,
        ISpaceRegistry _spaceRegistryContract,
        ISpaceLocker _initialLocker,
        address _tm
    ) public {
        require(setupDone == false, "Setup already done");
        setupDone = true;

        spaceTokenContract = _spaceTokenContract;
        spaceRegistryContract = _spaceRegistryContract;
        spaceReputationContract = _spaceReputationContract;
        tm = _tm;

        require(_spaceRegistryContract.isValid(_initialLocker), "Not a valid locker");

        uint256 initialSpaceTokenId = _initialLocker.getSpaceTokenId();
        approvedSpaceTokens[initialSpaceTokenId] = true;

        uint256 reputation = _spaceReputationContract.balanceOf(initialSpaceTokenId);

        _mintReputation(_initialLocker, reputation);
    }

    /**
     * @notice Increment the counter by `step`
     * @param step Amount to increment by
     */
    function increment(uint256 step) external auth(INCREMENT_ROLE) {
        value = value.add(step);
        emit Increment(msg.sender, step);
    }

    function mintReputation(uint256 _tokenId, address _spaceLocker) external {
        require(spaceRegistryContract.isValid(_spaceLocker), "Not a valid locker");

        // TODO: check the owner is a receiver
        uint256 reputation = spaceReputationContract.balanceOf(_tokenId);
        require(reputation > 0, "Reputation is 0");

        uint256 erc20balance = TokenManager(tm).token().balanceOf(_spaceLocker);

        require(erc20balance == 0, "Balance should be burned first");
        _mintReputation(_spaceLocker, reputation);
    }

    function _mintReputation(address _beneficiary, uint256 _amount) internal {
        tm.call(abi.encodeWithSignature("mint", _beneficiary, _amount));
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
