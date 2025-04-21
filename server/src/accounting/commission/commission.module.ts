import {Module} from '@nestjs/common';
import {CommissionService} from './commission.service';
import {CommissionController} from './commission.controller';
import {ChainContractsModule} from "../../chain-contracts/chain-contracts.module";

@Module({
    controllers: [CommissionController],
    providers: [CommissionService],
    imports: [ChainContractsModule,]
})
export class CommissionModule {
}
