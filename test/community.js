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
const EVMScriptRegistryFactory = artifacts.require(
  'EVMScriptRegistryFactory.sol'
);
const MiniMeTokenFactory = artifacts.require('MiniMeTokenFactory.sol');

const SpaceReputation = artifacts.require('SpaceReputation.sol');
const SpaceToken = artifacts.require('SpaceToken.sol');
const SpaceLocker = artifacts.require('SpaceLocker.sol');
const SpaceLockerFactory = artifacts.require('SpaceLockerFactory.sol');
const SpaceRegistry = artifacts.require('SpaceRegistry.sol');

const ANY_ADDRESS = '0xffffffffffffffffffffffffffffffffffffffff';
const n = '0x00';

// MiniMeToken.numberFormat = 'String';

// https://github.com/aragon/aragon-apps/blob/master/apps/token-manager/test/tokenmanager.js

contract('Community', ([appManager, user, alice]) => {
  let app;
  let tokenManager;
  let token;

  beforeEach('deploy dao and app', async () => {
    // TODO: deploy ens
    // Deploy the app's base contract.
  });

  it.only('should allow anyone creating community', async () => {
    // console.log(('web3>>>', ENSFactory.web3));
    // const factory = await ENSFactory.new();
    // const receipt = await factory.newENS(appManager);
    const miniMeTokenFactory = await MiniMeTokenFactory.new();
    //
    // const ensAddr = receipt.logs.filter(l => l.event === 'DeployENS')[0].args.ens;
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

    const { apmFactory, ens, apm } = await DeployApm(null, {
      artifacts,
      web3: ENSFactory.web3,
      ensAddress: null,
      owner: appManager,
      daoFactoryAddress: daoFactory.address,
      verbose: true,
    });
    // console.log('hey11111', result);
    // const d
    console.log('blah-1');

    // const deployer = new TemplatesDeployer(web3, artifacts, appManager, { apps, ens, verbose, daoFactory, miniMeFactory })
    const deployer = new TemplatesDeployer(
      ENSFactory.web3,
      artifacts,
      appManager,
      {
        apps: [],
        ens: ens.address,
        verbose: true,
        daoFactory: daoFactory.address,
        miniMeTokenFactory,
      }
    );
    console.log('blah-2');
    const template = await deployer.deploy('galt-template', 'Template');
    console.log('blah-3');

    const spaceLockerFactory = await SpaceLockerFactory.new();
    const spaceRegistry = await SpaceRegistry.new(spaceLockerFactory.address);
    const spaceReputation = await SpaceReputation.new();
    console.log('blah-4');
    const spaceToken = await SpaceToken.new('Foo', 'BAR');
    console.log('hey-1');

    spaceLockerFactory.setRegistry(spaceRegistry.address);
    console.log('hey-2');

    // TODO: deploy my contracts
    console.log('hey-3');
    const res = await template.newInstance(
      spaceToken.address,
      spaceReputation.address,
      spaceRegistry.address
    );
    console.log('hey-4');
    console.log('fuck2');
    console.log('len', res.logs.length);
    console.log('logs', res.logs);
    // await app.increment(2, { from: user });
    // assert.equal(await token.balanceOf(user), 2);
    assert.equal(2, 3);
    assert.fail('fuck');
  });
});
