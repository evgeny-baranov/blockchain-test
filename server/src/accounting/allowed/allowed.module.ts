import {Module} from '@nestjs/common';
import {AllowedService} from './allowed.service';
import {AllowedController} from './allowed.controller';
import {ChainContractsModule} from "../../chain-contracts/chain-contracts.module";
import {SignerModule} from "../../signer/signer.module";

@Module({
    controllers: [AllowedController],
    providers: [AllowedService],
    imports: [ChainContractsModule, SignerModule]
})
export class AllowedModule {
}
