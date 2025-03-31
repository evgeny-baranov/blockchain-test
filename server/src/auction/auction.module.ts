import {Module} from '@nestjs/common';
import {AuctionController} from './auction.controller';
import {AuctionService} from './auction.service';
import {SignerModule} from "../signer/signer.module";

@Module({
    imports: [SignerModule],
    controllers: [AuctionController],
    providers: [AuctionService]
})
export class AuctionModule {

}
