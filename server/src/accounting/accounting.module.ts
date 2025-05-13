import {Module} from '@nestjs/common';
import {AccountingService} from './accounting.service';
import {AccountingController} from './accounting.controller';
import {CommissionModule} from './commission/commission.module';
import {AllowedModule} from './allowed/allowed.module';
import {BalanceModule} from './balance/balance.module';

@Module({
    controllers: [AccountingController],
    providers: [AccountingService],
    imports: [CommissionModule, AllowedModule, BalanceModule],
})
export class AccountingModule {
}
