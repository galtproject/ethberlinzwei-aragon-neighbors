/* global artifacts contract beforeEach it assert */

const { getEventArgument } = require('@aragon/test-helpers/events');
const SpaceReputation = artifacts.require('SpaceReputation.sol');
const SpaceToken = artifacts.require('SpaceToken.sol');
const SpaceLockerFactory = artifacts.require('SpaceLockerFactory.sol');
const SpaceRegistry = artifacts.require('SpaceRegistry.sol');

const alice = '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7';
const bob = '0x8401Eb5ff34cc943f096A32EF3d5113FEbE8D4Eb';
const charlie = '0x306469457266CBBe7c0505e8Aad358622235e768';
const dan = '0xd873F6DC68e3057e4B7da74c6b304d0eF0B484C7';

const AREAS = [
  3778,
  4939,
  6326,
  8221,
  4003,
  5649,
  6197,
  10422,
  8587,
  9349,
  5533,
  7374,
  11434,
  11486,
  9151,
];

const CONTOURS = [
  ['sezupu2767zy', 'sezupu2rsvrf', 'sezupsrwpjpf'],
  ['sezupsrrhsxu', 'sezupsxddtzu', 'sezupsx5fkzg', 'sezupswby0xg'],
  ['sezupsw9n1zu', 'sezupsw1sqrf', 'sezupswjzmzg', 'sezupswv0txy'],
  ['sezupswn1jrb', 'sezupstcgvxz', 'sezupst5tcxz', 'sezupstr6hrb'],
  ['sezupssgvvds', 'sezupstn9nf8', 'sezupssx2m49', 'sezupssebgf9'],
  ['sezupssr7v49', 'sezupss72g4d', 'sezupsesrfds', 'sezupsgb5c6w'],
  ['sezupssc304x', 'sezupsktmvdw', 'sezups7zp9dw', 'sezupss1sz4e'],
  ['sezupst0gj4e', 'sezupsqp8f6s', 'sezupsmg6948', 'sezupskvp6dd'],
  ['sezupsq4yjfs', 'sezupsqr3ufd', 'sezupsrk89fe', 'sezupsr6bmfs'],
  [
    'sezupu1nb2pj',
    'sezupu29pkr1',
    'sezupu2sr8x1',
    'sezupu3knqxn',
    'sezupu3801p0',
  ],
  ['sezupu2y06p5', 'sezupu3m99rh', 'sezupu92vtp4', 'sezupu949sz0'],
  [
    'sezupu9h5mp1',
    'sezupu9ejxr5',
    'sezupuc8zjr1',
    'sezupuc0vtr1',
    'sezupu9np4r4',
  ],
  [
    'sezupu0t2n2m',
    'sezupu0gwkb7',
    'sezupu12g1bk',
    'sezupgcn7jb2',
    'sezupu01n326',
  ],
  ['sezupu0mbx0k', 'sezupu016h2q', 'sezupsp33u2q', 'sezupspx9nb6'],
  ['sezupsr21eb6', 'sezupsp17d87', 'sezupsn8k503', 'sezupsqb7522'],
];

module.exports = async truffleExecCallback => {
  const spaceLockerFactory = await SpaceLockerFactory.new();
  const spaceRegistry = await SpaceRegistry.new(spaceLockerFactory.address);
  const spaceReputation = await SpaceReputation.new();
  const spaceToken = await SpaceToken.new('Foo', 'BAR');

  await spaceLockerFactory.setRegistry(spaceRegistry.address);

  let receipt = await spaceToken.mint(alice);

  const count = 15;
  const tokens = [];

  for (let i = 0; i < count; i++) {
    try {
      const owner = [alice, bob, charlie, dan][i % 4];
      console.log(
        'Deploying #',
        i,
        'owner',
        owner,
        'area',
        AREAS[i],
        'countour',
        CONTOURS[i]
      );
      receipt = await spaceToken.mint(owner);
      tokens[i] = getEventArgument(receipt, 'Mint', 'id');
      await spaceReputation.setArea(tokens[i], AREAS[i]);
      await spaceReputation.setContour(tokens[i], CONTOURS[i]);
    } catch (e) {
      console.log('Error', e);
    }
  }
};
