import {Test, TestingModule} from '@nestjs/testing';
import {RoleController} from './role.controller';
import {RoleService} from './role.service';

describe('RoleController', () => {
    let controller: RoleController;
    let service: RoleService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RoleController],
            providers: [
                {
                    provide: RoleService,
                    useValue: {
                        getAllRoles: jest.fn(),
                        getMyRoles: jest.fn(),
                        getRolesOf: jest.fn(),
                        grantRole: jest.fn(),
                        revokeRole: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<RoleController>(RoleController);
        service = module.get<RoleService>(RoleService);
    });

    it('should return all roles', async () => {
        const mockRoles = [{label: 'ADMIN', role: 0n, selectors: []}];
        (service.getAllRoles as jest.Mock).mockResolvedValue(mockRoles);

        const result = await controller.getRole();
        expect(result).toEqual(mockRoles);
        expect(service.getAllRoles).toHaveBeenCalled();
    });

    it('should call getMyRoles', async () => {
        const roles = [{label: 'MINTER', role: 2n, selectors: []}];
        (service.getMyRoles as jest.Mock).mockResolvedValue(roles);

        const result = await controller.getMyRoles();
        expect(result).toEqual(roles);
        expect(service.getMyRoles).toHaveBeenCalled();
    });

    it('should call getRolesOf with address', async () => {
        const address = '0xabc123';
        const roles = [{label: 'ACCOUNTANT', role: 4n, selectors: []}];
        (service.getRolesOf as jest.Mock).mockResolvedValue(roles);

        const result = await controller.getRolesOf(address);
        expect(result).toEqual(roles);
        expect(service.getRolesOf).toHaveBeenCalledWith(address);
    });

    it('should call grantRole with uppercase role', async () => {
        const address = '0xabc123';
        const role = 'admin';
        (service.grantRole as jest.Mock).mockResolvedValue(undefined);

        await controller.grantRole(address, role);
        expect(service.grantRole).toHaveBeenCalledWith(address, 'ADMIN');
    });

    it('should call revokeRole with uppercase role', async () => {
        const address = '0xabc123';
        const role = 'minter';
        (service.revokeRole as jest.Mock).mockResolvedValue(undefined);

        await controller.revokeRole(address, role);
        expect(service.revokeRole).toHaveBeenCalledWith(address, 'MINTER');
    });
});
