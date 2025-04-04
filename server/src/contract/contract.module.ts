import {Module} from '@nestjs/common';
import {ContractController} from './contract.controller';
import {ContractService} from './contract.service';
import {SignerModule} from "../signer/signer.module";

@Module({
    imports: [SignerModule],
    controllers: [ContractController],
    providers: [ContractService]
})
export class ContractModule {
}
