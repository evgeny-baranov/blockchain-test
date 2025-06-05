import {Test, TestingModule} from '@nestjs/testing';
import {RoleService} from './role.service';
import {SignerService} from '../signer/signer.service';
import {ChainContractsService} from '../chain-contracts/chain-contracts.service';
import {BadRequestException, NotFoundException} from "@nestjs/common";
import {mockRevertAccessManagerUnauthorizedAccount} from "../__mock__/errors.mock";
import {MockChainContractsService} from "../__mock__/chain-contract-service.mock";

describe('RoleService', () => {
    const signerAddress = '0xdeadbeef00000000000000000000000000000001';
    let roleService: RoleService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RoleService,
                {
                    provide: SignerService, useValue: {
                        publicAddress: signerAddress,
                    }
                },
                {
                    provide: ChainContractsService,
                    useValue: new MockChainContractsService()
                },
            ],
        }).compile();

        roleService = module.get<RoleService>(RoleService);
        roleService.onModuleInit();
    });

    it('should return all roles', async () => {
        const roles = await roleService.getAllRoles();

        expect(roles).toHaveLength(6);
        expect(roles.some(r => r.label === 'ADMIN')).toBe(true);
        expect(roles.some(r => r.label === 'BURNER')).toBe(true);
    });

    it('should return a role by ID', async () => {
        const role = await roleService.getRole(0n);

        expect(role.label).toBe('ADMIN');
    });

    it('should get my roles (based on signer address)', async () => {
        const fnGetRolesOf = jest.fn().mockResolvedValue([4n, 5n]);
        (roleService as any).accessManager.getRolesOf = fnGetRolesOf;

        const roles = await roleService.getMyRoles();

        expect(fnGetRolesOf).toHaveBeenCalledWith(signerAddress);
        expect(roles).toHaveLength(2);
        expect(roles.some(r => r.label === 'ADMIN')).toBe(false);
        expect(roles.some(r => r.label === 'BURNER')).toBe(false);
        expect(roles.some(r => r.label === 'ACCOUNTANT')).toBe(true);
        expect(roles.some(r => r.label === 'CUSTODIAN')).toBe(true);
    });

    it('should call grantRole correctly', async () => {
        await expect(roleService.grantRole(
            '0xabc123', 1n)
        ).resolves.not.toThrow();
    });

    it('should call revokeRole correctly', async () => {
        await expect(
            roleService.revokeRole('0xabc123', 1n)
        ).resolves.not.toThrow();
    });

    it('should throw NotFoundException if role is not found', async () => {
        (roleService as any).accessManager.getRoles = jest.fn().mockResolvedValue([]);
        await expect(
            roleService.getRole(1n)
        ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException from grantRole', async () => {
        (roleService as any).accessManager.grantRole = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                signerAddress
            )
        );

        await expect(
            roleService.grantRole('0xabc123', 1n)
        ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException from revokeRole', async () => {
        (roleService as any).accessManager.revokeRole = jest.fn().mockRejectedValue(
            mockRevertAccessManagerUnauthorizedAccount(
                signerAddress
            )
        );

        await expect(
            roleService.revokeRole('0xabc123', 1n)
        ).rejects.toThrow(BadRequestException);
    });

    it('should return roles for given address using getRolesOf', async () => {
        const fnGetRolesOf = jest.fn().mockResolvedValue([1n, 2n, 3n]);
        (roleService as any).accessManager.getRolesOf = fnGetRolesOf;

        const roles = await roleService.getRolesOf(signerAddress);

        expect(fnGetRolesOf).toHaveBeenCalledWith(signerAddress);
        expect(roles).toHaveLength(3);
        expect(roles.some(r => r.label === 'ADMIN')).toBe(false);
        expect(roles.some(r => r.label === 'ACCOUNTANT')).toBe(false);
        expect(roles.some(r => r.label === 'CUSTODIAN')).toBe(false);

        expect(roles.some(r => r.label === 'UPGRADE')).toBe(true);
        expect(roles.some(r => r.label === 'MINTER')).toBe(true);
        expect(roles.some(r => r.label === 'BURNER')).toBe(true);
    });
});
