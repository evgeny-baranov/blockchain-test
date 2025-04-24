// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721BurnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {AccessManager} from "../../AccessManager.sol";
import {Version} from "../../utils/version/Version.sol";
import {ViewAccessManagedUpgradeable} from "../../utils/ViewAccessManagedUpgradeable.sol";
import {IAuctionLot} from "./IAuctionLot.sol";

/// @custom:security-contact info@baranov.eu
contract AuctionLotV1 is
Version,
ERC721EnumerableUpgradeable,
ERC721PausableUpgradeable,
ERC721BurnableUpgradeable,
ERC721URIStorageUpgradeable,
ViewAccessManagedUpgradeable,
UUPSUpgradeable,
IAuctionLot
{
    uint256 private _nextTokenId;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function mint(address to, string memory uri) external restricted returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;

        // Mint the token
        _safeMint(to, tokenId);

        // Set the token URI
        _setTokenURI(tokenId, uri);

        return tokenId;
    }

    function burn(uint256 tokenId) public override(ERC721BurnableUpgradeable, IAuctionLot) restricted {
        super.burn(tokenId);
    }

    function initialize(address initialAuthority) initializer public {
        require(initialAuthority != address(0), "Invalid authority address");

        _nextTokenId = 1;

        __ERC721_init("AuctionLot", "AULOT");
        __ERC721Enumerable_init();
        __ERC721URIStorage_init();
        __ERC721Pausable_init();
        __ERC721Burnable_init();
        __AccessManaged_init(initialAuthority);
        __UUPSUpgradeable_init();
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://baranov.eu/nft/";
    }

    function pause() public restricted {
        _pause();
    }

    function unpause() public restricted {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal restricted override {

    }

    // The following functions are overrides required by Solidity.
    function _update(address to, uint256 tokenId, address auth) internal
    override(ERC721EnumerableUpgradeable, ERC721PausableUpgradeable, ERC721Upgradeable)
    returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value) internal
    override(ERC721EnumerableUpgradeable, ERC721Upgradeable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId) public view
    override(ERC721URIStorageUpgradeable, ERC721Upgradeable)
    returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view
    override(ERC721EnumerableUpgradeable, ERC721URIStorageUpgradeable, ERC721Upgradeable)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getTokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](balance);
        for (uint256 i = 0; i < balance; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        return tokenIds;
    }
}
