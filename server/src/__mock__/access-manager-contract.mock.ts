import {Roles} from '@blockchain/contracts/AccessManager';
import {mockAllRoles} from "./roles.mock";
import {AccessManager__factory} from '@blockchain/factories/contracts';

const roleStruct: Roles.RoleSelectorsStructOutput[] = mockAllRoles();

export class MockAccessManagerContract {
    getRoles = jest.fn().mockResolvedValue(roleStruct);
    getRolesOf = jest.fn().mockResolvedValue([0n]);
    grantRole = jest.fn().mockResolvedValue(undefined);
    revokeRole = jest.fn().mockResolvedValue(undefined);
    interface = AccessManager__factory.createInterface()
}