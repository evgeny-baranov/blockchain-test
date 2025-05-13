import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {AuctionLotService} from './auction-lot.service';
import {BigNumberish} from "ethers";

@Controller('auction-lot')
export class AuctionLotController {
    constructor(
        private readonly auctionLotService: AuctionLotService,
    ) {
    }

    @Post()
    async createAuctionLot(@Body() body: {
        uri: string
    }) {
        return this.auctionLotService.createAuctionLot(
            body.uri
        );
    }

    @Get()
    async getAuctionLot() {
        return this.auctionLotService.getTokensOfOwner();
    }

    @Get(':id')
    async getAuctionLotById(
        @Param('id') id: BigNumberish
    ) {
        return this.auctionLotService.getTokenInfo(id);
    }
}
