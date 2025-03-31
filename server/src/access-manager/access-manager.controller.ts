import {Controller, Get, Param} from '@nestjs/common';
import {AccessManagerService} from "./access-manager.service";

@Controller('access-manager')
export class AccessManagerController {

    constructor(
        private readonly accessManagerService: AccessManagerService
    ) {
    }

    @Get('role')
    getRole() {
        return this.accessManagerService.roles();
    }

    @Get('contract')
    registeredContracts() {
        return this.accessManagerService.registeredContracts();
    }

    @Get('contract/:name')
    getContract(@Param('name') name: string) {
        return this.accessManagerService.getContract(name);
    }
}
