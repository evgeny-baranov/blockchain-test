import {Module} from '@nestjs/common';
import {BalanceService} from './balance.service';
import {BalanceController} from './balance.controller';
import {ChainContractsModule} from "../../chain-contracts/chain-contracts.module";
import {SignerModule} from "../../signer/signer.module";

@Module({
    controllers: [BalanceController],
    providers: [BalanceService],
    imports: [ChainContractsModule, SignerModule,],
})
export class BalanceModule {
}
