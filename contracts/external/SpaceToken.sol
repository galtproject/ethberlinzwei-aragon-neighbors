pragma solidity 0.4.24;

import "openzeppelin-solidity/contracts/token/ERC721/ERC721Token.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract SpaceToken is ERC721Token, Ownable {
  event Mint(address to, uint256 id);

  constructor(string _name, string _symbol) public ERC721Token(_name, _symbol) {
  }

  uint256 internal counter;

  function mint(address _to) onlyOwner {
    uint256 id = counter;
    counter += 1;

    _mint(_to, id);

    emit Mint(_to, id);
  }
}
