import {Module} from '@nestjs/common';
import {AuctionController} from './auction.controller';
import {AuctionService} from './auction.service';
import {SignerModule} from "../signer/signer.module";
import {ChainContractsModule} from "../chain-contracts/chain-contracts.module";

@Module({
    imports: [SignerModule, ChainContractsModule],
    controllers: [AuctionController],
    providers: [AuctionService]
})
export class AuctionModule {

}
