import {Module} from '@nestjs/common';
import {AccountingService} from './accounting.service';
import {AccountingController} from './accounting.controller';
import {CommissionModule} from './commission/commission.module';
import {AllowedModule} from './allowed/allowed.module';
import {ChainContractsModule} from "../chain-contracts/chain-contracts.module";
import {SignerModule} from "../signer/signer.module";

@Module({
    controllers: [AccountingController],
    providers: [AccountingService],
    imports: [CommissionModule, AllowedModule, ChainContractsModule, SignerModule],
})
export class AccountingModule {
}
