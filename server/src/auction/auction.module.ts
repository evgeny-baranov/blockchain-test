import {Module} from '@nestjs/common';
import {AuctionController} from './auction.controller';
import {AuctionService} from './auction.service';
import {SignerModule} from "../signer/signer.module";
import {ChainContractsModule} from "../chain-contracts/chain-contracts.module";
import {AuctionLotModule} from './auction-lot/auction-lot.module';

@Module({
    imports: [SignerModule, ChainContractsModule, AuctionLotModule],
    controllers: [AuctionController],
    providers: [AuctionService]
})
export class AuctionModule {

}
