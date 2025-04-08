import {Module} from '@nestjs/common';
import {ContractController} from './contract.controller';
import {ContractService} from './contract.service';
import {ChainContractsModule} from "../chain-contracts/chain-contracts.module";

@Module({
    imports: [ChainContractsModule],
    controllers: [ContractController],
    providers: [ContractService]
})
export class ContractModule {
}
