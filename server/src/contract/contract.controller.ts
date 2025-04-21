import {Controller, Get, Param} from '@nestjs/common';
import {ContractService} from "./contract.service";

@Controller('contract')
export class ContractController {

    constructor(
        private readonly contractService: ContractService,
    ) {
    }

    @Get('')
    registeredContracts() {
        return this.contractService.registeredContracts();
    }

    @Get(':name')
    getContract(
        @Param('name') name: string
    ) {
        return this.contractService.getContract(name);
    }
}
