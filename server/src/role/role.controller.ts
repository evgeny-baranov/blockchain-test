import {Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {RoleService} from './role.service';
import {AddressLike} from "ethers";

@Controller('role')
export class RoleController {
    constructor(
        private readonly roleService: RoleService
    ) {
    }

    @Get()
    getRole() {
        return this.roleService.getAllRoles();
    }

    @Get('my')
    getMyRoles() {
        return this.roleService.getMyRoles();
    }

    @Get(':address')
    getRolesOf(@Param('address') address: AddressLike) {
        return this.roleService.getRolesOf(address);
    }

    @Put(':address/:role')
    grantRole(
        @Param('address') address: AddressLike,
        @Param('role') role: string,
    ) {
        return this.roleService.grantRole(
            address,
            role.toUpperCase()
        );
    }

    @Delete(':address/:role')
    revokeRole(
        @Param('address') address: AddressLike,
        @Param('role') role: string,
    ) {
        return this.roleService.revokeRole(
            address,
            role.toUpperCase()
        );
    }
}
