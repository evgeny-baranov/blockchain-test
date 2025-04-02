import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AuctionModule} from './auction/auction.module';
import {SignerService} from './signer/signer.service';
import {SignerModule} from './signer/signer.module';
import {AccessManagerModule} from './access-manager/access-manager.module';
import {ConfigModule} from "@nestjs/config";
import { ChainContractsModule } from './chain-contracts/chain-contracts.module';

@Module({
    imports: [AuctionModule, SignerModule, AccessManagerModule, ConfigModule.forRoot({
        isGlobal: true,
    }), ChainContractsModule,],
    controllers: [AppController],
    providers: [AppService, SignerService],
})
export class AppModule {
}
