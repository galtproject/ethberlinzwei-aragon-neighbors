/* global artifacts contract beforeEach it assert */

const { assertRevert } = require('@aragon/test-helpers/assertThrow');
const { getEventArgument } = require('@aragon/test-helpers/events');
const { hash } = require('eth-ens-namehash');
// const deployDAO = require('./helpers/deployDAO');
const TemplatesDeployer = require('@aragon/templates-shared/lib/TemplatesDeployer');
const DeployApm = require('@aragon/os/scripts/deploy-apm');

const Kernel = artifacts.require('Kernel.sol');
const Template = artifacts.require('Template.sol');
// const ENS = artifacts.require('ENS.sol');
const ENSFactory = artifacts.require('ENSFactory.sol');
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

let app;
let counterApp;
let tokenManager;
let voting;
let token;

const appManager = '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7';

module.exports = async (
  truffleExecCallback
) => {
  console.log('hey-1');
  const spaceLockerFactory = await SpaceLockerFactory.new();
  console.log('hey-2');
  const spaceRegistry = await SpaceRegistry.new(spaceLockerFactory.address);
  console.log('hey-4');
  const spaceReputation = await SpaceReputation.new();
  const spaceToken = await SpaceToken.new('Foo', 'BAR');

  await spaceLockerFactory.setRegistry(spaceRegistry.address);
  console.log('hey-1-1');
  const { counterApp, tokenManager, dao} = await deployDao();
  console.log('DAO address is', dao.address);
};

async function deployDao() {
  // console.log(('web3>>>', ENSFactory.web3));
  const factory = await ENSFactory.new();
  let receipt = await factory.newENS(appManager);
  const miniMeTokenFactory = await MiniMeTokenFactory.new();

  const ensAddr = receipt.logs.filter(l => l.event === 'DeployENS')[0].args.ens;
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
  dao = Kernel.at(
    getEventArgument(receipt, 'DeployInstance', 'dao')
  );

  return {
    dao,
    tokenManager,
    voting,
    counterApp,
  };
}
