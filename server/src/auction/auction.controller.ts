import {Body, Controller, Delete, Get, Param, Post, Put} from '@nestjs/common';
import {AuctionService} from "./auction.service";
import {AuctionStartDto} from "./dto/auction-start.dto";
import {AuctionBidDto} from "./dto/auction-bid.dto";
import {BigNumberish} from "ethers";

@Controller('auction')
export class AuctionController {

    constructor(
        private readonly auctionService: AuctionService
    ) {
    }

    @Get('')
    async getAuctions() {
        return this.auctionService.getMyAuctions();
    }

    @Delete(':auctionId')
    async cancelAuction(
        @Param('auctionId') auctionId: BigNumberish,
    ) {
        await this.auctionService.cancelAuction(auctionId);
    }

    @Get(':auctionId')
    async getAuction(
        @Param('auctionId') auctionId: BigNumberish,
    ) {
        return this.auctionService.getAuction(auctionId);
    }

    @Put(':auctionId/bid')
    async placeBid(
        @Param('auctionId') auctionId: BigNumberish,
        @Body() bid: AuctionBidDto
    ) {
        return this.auctionService.placeBid(
            auctionId,
            BigInt(bid.amount)
        );
    }

    @Put(':auctionId/finalise')
    finaliseAuction(
        @Param('auctionId') auctionId: BigNumberish,
    ) {
        return this.auctionService.finaliseAuction(
            auctionId
        );
    }

    @Post()
    startAuction(@Body() dto: AuctionStartDto) {
        return this.auctionService.startAuction(dto);
    }
}
