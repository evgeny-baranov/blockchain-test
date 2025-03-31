import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {AuctionService} from "./auction.service";
import {StartAuctionDto} from "../dto/start-auction.dto";

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
    async getAuctionLotById(@Param('id') id: string) {
        return this.auctionService.getTokenInfo(id);
    }

    @Post()
    startAuction(@Body() dto: StartAuctionDto) {
        return this.auctionService.startAuction(dto);
    }
}
