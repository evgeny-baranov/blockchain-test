import {Controller, Get, Param} from '@nestjs/common';
import {ContractService} from "./contract.service";

@Controller('contract')
export class ContractController {

    constructor(
        private readonly accessManagerService: ContractService,
    ) {
    }

    @Get('')
    registeredContracts() {
        return this.accessManagerService.registeredContracts();
    }

    @Get(':name')
    getContract(
        @Param('name') name: string
    ) {
        return this.accessManagerService.getContract(name);
    }
}
