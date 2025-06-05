import {Roles} from '@blockchain/contracts/AccessManager';
import {mockAllRoles} from "./roles.mock";
import {AccessManager__factory} from '@blockchain/factories/contracts';
import {mockContractRegistry} from "./contracts.mock";

const roleStruct: Roles.RoleSelectorsStructOutput[] = mockAllRoles();

export class MockAccessManagerContract {
    getRoles = jest.fn().mockResolvedValue(roleStruct);
    getRolesOf = jest.fn().mockResolvedValue([0n]);
    grantRole = jest.fn().mockResolvedValue(undefined);
    revokeRole = jest.fn().mockResolvedValue(undefined);
    registeredContracts = jest.fn().mockResolvedValue(mockContractRegistry);
    interface = AccessManager__factory.createInterface()
}