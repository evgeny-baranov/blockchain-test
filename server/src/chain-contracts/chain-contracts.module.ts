import {Module} from '@nestjs/common';
import {ChainContractsService} from './chain-contracts.service';
import {SignerModule} from "../signer/signer.module";

@Module({
    imports: [SignerModule],
    providers: [ChainContractsService],
    exports: [ChainContractsService],
})
export class ChainContractsModule {
}
