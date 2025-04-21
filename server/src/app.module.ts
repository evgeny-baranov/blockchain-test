import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuctionModule} from './auction/auction.module';
import {SignerService} from './signer/signer.service';
import {SignerModule} from './signer/signer.module';
import {ContractModule} from './contract/contract.module';
import {ConfigModule} from "@nestjs/config";
import {ChainContractsModule} from './chain-contracts/chain-contracts.module';
import {AccountingModule} from './accounting/accounting.module';
import {RoleModule} from './role/role.module';

@Module({
    imports: [
        AuctionModule,
        SignerModule,
        ContractModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ChainContractsModule,
        AccountingModule,
        RoleModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        SignerService,
    ],
})
export class AppModule {
}
