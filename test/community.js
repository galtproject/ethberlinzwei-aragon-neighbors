/* global artifacts contract beforeEach it assert */

const { assertRevert } = require('@aragon/test-helpers/assertThrow');
const { getEventArgument } = require('@aragon/test-helpers/events');
const { hash } = require('eth-ens-namehash');
// const deployDAO = require('./helpers/deployDAO');
const TemplatesDeployer = require('@aragon/templates-shared/lib/TemplatesDeployer');
const DeployApm = require('@aragon/os/scripts/deploy-apm');

const Template = artifacts.require('Template.sol');
// const ENS = artifacts.require('ENS.sol');
const ENSFactory = artifacts.require('ENSFactory.sol');
const Kernel = artifacts.require('Kernel.sol');
const ACL = artifacts.require('ACL.sol');
const DAOFactory = artifacts.require('DAOFactory.sol');
const TokenManager = artifacts.require('TokenManager.sol');
const Voting = artifacts.require('Voting.sol');
const EVMScriptRegistryFactory = artifacts.require(
  'EVMScriptRegistryFactory.sol'
);
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory.sol');

const CounterApp = artifacts.require('CounterApp.sol');

const SpaceReputation = artifacts.require('SpaceReputation.sol');
const SpaceToken = artifacts.require('SpaceToken.sol');
const SpaceLocker = artifacts.require('SpaceLocker.sol');
const SpaceLockerFactory = artifacts.require('SpaceLockerFactory.sol');
const SpaceRegistry = artifacts.require('SpaceRegistry.sol');

const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff';
const n = '0x00';

// MiniMeToken.numberFormat = 'String';

// https://github.com/aragon/aragon-apps/blob/master/apps/token-manager/test/tokenmanager.js

contract('Community', ([appManager, user, alice, bob]) => {
  let app;
  let tokenManager;
  let voting;
  let counterApp;
  let token;

  beforeEach('deploy dao and app', async () => {
  });

  it.only('should allow anyone creating community', async () => {
    const spaceLockerFactory = await SpaceLockerFactory.new();
    const spaceRegistry = await SpaceRegistry.new(spaceLockerFactory.address);
    const spaceReputation = await SpaceReputation.new();
    const spaceToken = await SpaceToken.new('Foo', 'BAR');

    await spaceLockerFactory.setRegistry(spaceRegistry.address);

    let receipt = await spaceToken.mint(alice);
    const token1 = getEventArgument(receipt, 'Mint', 'id');
    receipt = await spaceToken.mint(bob);
    const token2 = getEventArgument(receipt, 'Mint', 'id');
    receipt = await spaceToken.mint(alice);
    const token3 = getEventArgument(receipt, 'Mint', 'id');
    receipt = await spaceToken.mint(bob);
    const token4 = getEventArgument(receipt, 'Mint', 'id');

    receipt = await spaceLockerFactory.build(spaceToken.address, token1, alice);
    const locker1 = SpaceLocker.at(getEventArgument(receipt, 'NewSpaceLocker', 'spaceLocker'));
    receipt = await spaceLockerFactory.build(spaceToken.address, token2, bob);
    const locker2 = SpaceLocker.at(getEventArgument(receipt, 'NewSpaceLocker', 'spaceLocker'));

    const { counterApp, tokenManager } = await deployDao();
    await counterApp.setup(
      spaceToken.address,
      spaceReputation.address,
      spaceRegistry.address,
      locker1.address,
      tokenManager.address
    );


  });

  async function deployDao() {
    // console.log(('web3>>>', ENSFactory.web3));
    const factory = await ENSFactory.new();
    let receipt = await factory.newENS(appManager);
    const miniMeTokenFactory = await MiniMeTokenFactory.new();

    const ensAddr = receipt.logs.filter(l => l.event === 'DeployENS')[0].args
      .ens;
    // console.log('====================');
    // console.log('Deployed ENS:', ensAddr);

    const kernelBase = await Kernel.new(true);
    const aclBase = await ACL.new();
    const registryFactory = await EVMScriptRegistryFactory.new();
    const daoFactory = await DAOFactory.new(
      kernelBase.address,
      aclBase.address,
      registryFactory.address
    );

    const { apmFactory, ens } = await DeployApm(null, {
      artifacts,
      web3: ENSFactory.web3,
      ensAddress: ensAddr,
      owner: appManager,
      daoFactoryAddress: daoFactory.address,
      verbose: true,
    });

    const template = await artifacts
      .require('Template')
      .new(daoFactory.address, ensAddr, miniMeTokenFactory.address);

    const apmAddr = await artifacts
      .require('PublicResolver')
      .at(await ens.resolver(hash('aragonpm.eth')))
      .addr(hash('aragonpm.eth'));
    const apm = artifacts.require('APMRegistry').at(apmAddr);

    const newRepo = async (apm, name, acc, contract) => {
      console.log(`Creating Repo for ${contract}`);
      const c = await artifacts.require(contract).new();
      return apm.newRepoWithVersion(name, acc, [1, 0, 0], c.address, '0x1245');
    };

    console.log('Deploying apps in local network');
    await newRepo(apm, 'voting', appManager, 'Voting');
    await newRepo(apm, 'token-manager', appManager, 'TokenManager');
    await newRepo(apm, 'counter-app', appManager, 'CounterApp');

    console.log('apmAddr', apmAddr);

    receipt = await template.newInstance();

    tokenManager = TokenManager.at(
      getEventArgument(receipt, 'DeployInstance', 'tokenManager')
    );
    voting = Voting.at(getEventArgument(receipt, 'DeployInstance', 'voting'));
    counterApp = CounterApp.at(
      getEventArgument(receipt, 'DeployInstance', 'counterApp')
    );

    return {
      tokenManager,
      voting,
      counterApp,
    };
  }
});
