import {Injectable, InternalServerErrorException, NotFoundException, OnModuleInit} from '@nestjs/common';
import {AddressLike, BigNumberish} from "ethers";
import {AccessManager} from '@blockchain/contracts';
import {Roles} from '@blockchain/contracts/AccessManager';
import {SignerService} from "../signer/signer.service";
import {ChainContractsService} from "../chain-contracts/chain-contracts.service";

@Injectable()
export class RoleService implements OnModuleInit {
    private contract!: AccessManager;

    constructor(
        private readonly signerService: SignerService,
        private readonly chainContractsService: ChainContractsService
    ) {
    }

    onModuleInit(): any {
        this.contract = this.chainContractsService.accessManagerContract;
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

        try {
            await this.contract.revokeRole(roleObj.role, address);
        } catch (error) {
            let message = ["Revoke role role failed"];
            if (error instanceof Error) {
                message.push(error.message);
            }

            if ((error as any).error?.data) {
                try {
                    const decoded = this.contract.interface.parseError((error as any).error.data);

                    if (decoded) {
                        console.error(decoded);
                        message.push(decoded.name);
                    }
                } catch (decodeError) {
                    console.error('decodeError', decodeError);
                }
            }

            console.error(message);

            throw new InternalServerErrorException(message.join(' '));
        }
    }

    async grantRole(
        address: AddressLike,
        role: BigNumberish | string,
        delay: BigNumberish = 0n
    ) {
        const roleObj = await this.getRole(role);

        try {
            await this.contract.grantRole(roleObj.role, address, delay);
        } catch (error) {
            let message = ["Grant role role failed"];
            if (error instanceof Error) {
                message.push(error.message);
            }

            if ((error as any).error?.data) {
                try {
                    const decoded = this.contract.interface.parseError((error as any).error.data);

                    if (decoded) {
                        console.error(decoded);
                        message.push(decoded.name);
                    }
                } catch (decodeError) {
                    console.error('decodeError', decodeError);
                }
            }

            console.error(message);

            throw new InternalServerErrorException(message.join(' '));
        }
    }
}
