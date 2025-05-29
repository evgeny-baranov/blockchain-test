import {Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {AddressLike, BigNumberish} from "ethers";
import {AccessManager} from '@blockchain/contracts';
import {Roles} from '@blockchain/contracts/AccessManager';
import {SignerService} from "../signer/signer.service";
import {ChainContractsService} from "../chain-contracts/chain-contracts.service";
import {handleSmartContractError} from "../errors/handle-smart-contract-errors";

@Injectable()
export class RoleService implements OnModuleInit {
    private accessManager!: AccessManager;

    constructor(
        private readonly signerService: SignerService,
        private readonly chainContractsService: ChainContractsService
    ) {
    }

    onModuleInit(): any {
        this.accessManager = this.chainContractsService.accessManagerContract;
    }

    async getRole(code: string | BigNumberish): Promise<Roles.RoleSelectorsStruct> {
        const roles = await this.getAllRoles();

        const role = roles.find(role => role.label === code || role.role === code);

        if (role == undefined) {
            throw new NotFoundException(`Role ${role} not found`);
        }

        return role;
    }

    async getAllRoles(): Promise<Roles.RoleSelectorsStruct[]> {
        const data: Roles.RoleSelectorsStructOutput[] = await this.accessManager.getRoles();

        return data.map(([label, role, selectors]) => ({
            label,
            role,
            selectors
        }));
    }

    async getRolesOf(address: AddressLike): Promise<Roles.RoleSelectorsStruct[]> {
        const roles = await this.accessManager.getRolesOf(address);

        return await Promise.all(
            roles.map((id: BigNumberish) => this.getRole(id))
        );
    }

    async getMyRoles(): Promise<Roles.RoleSelectorsStruct[]> {
        const address = this.signerService.publicAddress;
        const roles = await this.accessManager.getRolesOf(address);

        return await Promise.all(
            roles.map((id: BigNumberish) => this.getRole(id))
        );
    }

    async revokeRole(address: AddressLike, role: BigNumberish | string) {
        const roleObj = await this.getRole(role);

        try {
            await this.accessManager.revokeRole(roleObj.role, address);
        } catch (error) {
            handleSmartContractError(this.accessManager.interface, error);
        }
    }

    async grantRole(
        address: AddressLike,
        role: BigNumberish | string,
        delay: BigNumberish = 0n
    ) {
        const roleObj = await this.getRole(role);

        try {
            await this.accessManager.grantRole(roleObj.role, address, delay);
        } catch (error) {
            handleSmartContractError(this.accessManager.interface, error);
        }
    }
}
