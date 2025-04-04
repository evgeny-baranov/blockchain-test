import {Injectable, NotFoundException, OnModuleInit} from '@nestjs/common';
import {AddressLike, BigNumberish} from "ethers";
import {Roles} from '@blockchain/contracts/AccessManager';
import {ConfigService} from "@nestjs/config";
import {SignerService} from "../signer/signer.service";
import assert from "assert";
import {AccessManager__factory} from '@blockchain/factories/contracts';

@Injectable()
export class RoleService implements OnModuleInit {
    private readonly contractAddress: string;
    private contract: any;

    constructor(
        private readonly configService: ConfigService,
        private readonly signerService: SignerService,
    ) {
        const contractAddress = this.configService.get<string>('ADDRESS_ACCESS_MANAGER');
        assert(contractAddress, "ADDRESS_ACCESS_MANAGER not set");
        this.contractAddress = contractAddress;
    }

    onModuleInit(): any {
        this.contract = AccessManager__factory.connect(
            this.contractAddress,
            this.signerService.getSignerWallet()
        );
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
        const data: Roles.RoleSelectorsStructOutput[] = await this.contract.getRoles();

        return data.map(([label, role, selectors]) => ({
            label,
            role,
            selectors
        }));
    }

    async getRolesOf(address: AddressLike): Promise<BigNumberish[]> {
        return await this.contract.getRolesOf(address);
    }

    async getMyRoles() {
        const address = this.signerService.publicAddress;
        const roles = await this.contract.getRolesOf(address);

        return await Promise.all(
            roles.map((id: BigNumberish) => this.getRole(id))
        );
    }

    async revokeRole(address: AddressLike, role: BigNumberish | string) {
        const roleObj = await this.getRole(role);

        return await this.contract.revokeRole(roleObj.role, address);
    }

    async grantRole(
        address: AddressLike,
        role: BigNumberish | string,
        delay: BigNumberish = 0n
    ) {
        const roleObj = await this.getRole(role);

        return await this.contract.grantRole(roleObj.role, address, delay);
    }
}
