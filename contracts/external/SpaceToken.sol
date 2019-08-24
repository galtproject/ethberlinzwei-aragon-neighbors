pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";

contract SpaceToken is ERC721Token {
  constructor(string _name, string _symbol) public ERC721Token(_name, _symbol) {
  }
}
