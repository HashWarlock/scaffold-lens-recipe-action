// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ILensModuleRegistrant} from "../interfaces/IModuleRegistrant.sol";
import {IModuleRegistry} from "../interfaces/IModuleRegistry.sol";
import {Types} from "../libraries/Types.sol";

/**
 * @title LensModuleRegistrant
 * @author Paul Burke
 *
 * @notice This abstract contract adds a public `MODULE_REGISTRY` immutable field, and provides functions
 * for registering a module in the registry and checking if a module is registered.
 */
abstract contract LensModuleRegistrant is ILensModuleRegistrant, Ownable {
    event ModuleRegistered();

    error ModuleAlreadyRegistered();

    IModuleRegistry public immutable MODULE_REGISTRY;

    constructor(address moduleRegistry) {
        MODULE_REGISTRY = IModuleRegistry(moduleRegistry);
    }

    /// @inheritdoc ILensModuleRegistrant
    function isRegistered() public view override returns (bool) {
        return MODULE_REGISTRY.isModuleRegistered(address(this));
    }

    /// @inheritdoc ILensModuleRegistrant
    function registerModule() external override onlyOwner returns (bool) {
        if (isRegistered()) {
            revert ModuleAlreadyRegistered();
        }

        bool registered = MODULE_REGISTRY.registerModule(
            address(this),
            uint256(Types.ModuleType.PUBLICATION_ACTION_MODULE)
        );

        if (registered) {
            emit ModuleRegistered();
        }

        return registered;
    }
}