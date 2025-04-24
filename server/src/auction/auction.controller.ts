import {Body, Controller, Get, Param, Post, Put} from '@nestjs/common';
import {AuctionService} from "./auction.service";
import {StartAuctionDto} from "./start-auction.dto";

@Controller('auction')
export class AuctionController {

    constructor(
        private readonly auctionService: AuctionService
    ) {
    }

    @Post('lot')
    async createAuctionLot(@Body() body: {
        uri: string
    }) {
        return this.auctionService.createAuctionLot(
            body.uri
        );
    }

    @Get('lot')
    async getAuctionLot() {
        return this.auctionService.getTokensOfOwner();
    }

    @Get('lot/:id')
    async getAuctionLotById(
        @Param('id') id: string
    ) {
        return this.auctionService.getTokenInfo(id);
    }

    @Get('my')
    async getAuctions() {
        return this.auctionService.getMyAuctions();
    }

    @Put(':auctionId/bid')
    async placeBid(
        @Param('auctionId') auctionId: string,
        @Body() body: {
            amount: string
        }) {
        return this.auctionService.placeBid(
            auctionId,
            BigInt(body.amount)
        );
    }

    @Post()
    startAuction(@Body() dto: StartAuctionDto) {
        return this.auctionService.startAuction(dto);
    }
}
