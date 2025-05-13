import {Module} from '@nestjs/common';
import {AuctionLotService} from './auction-lot.service';
import {AuctionLotController} from './auction-lot.controller';
import {SignerModule} from "../../signer/signer.module";
import {ChainContractsModule} from "../../chain-contracts/chain-contracts.module";

@Module({
    imports: [SignerModule, ChainContractsModule],
    controllers: [AuctionLotController],
    providers: [AuctionLotService],
})
export class AuctionLotModule {
}
