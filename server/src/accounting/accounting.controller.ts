import {Body, Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {AccountingService} from './accounting.service';
import {AddressLike} from "ethers";

@Controller('accounting')
export class AccountingController {
    constructor(private readonly accountingService: AccountingService) {
    }

    @Put()
    updateCommissionPercent(
        @Body("commission") data: { commissionPercent: number }
    ) {
        this.accountingService.updateCommissionPercent(
            data.commissionPercent
        )
    }

    @Put("token")
    addAllowedToken(
        @Body() data: { creditAsset: AddressLike }
    ) {
        this.accountingService.addAllowedToken(
            data.creditAsset
        )
    }

    @Delete("token/:creditAsset")
    removeAllowedToken(
        @Param("creditAsset") creditAsset: AddressLike
    ) {
        this.accountingService.removeAllowedToken(
            creditAsset
        )
    }

    @Delete("commission/:creditAsset")
    withdrawCommission(
        @Body() data: { to: string },
        @Param("creditAsset") creditAsset: AddressLike
    ) {
        this.accountingService.withdrawCommission(
            creditAsset,
            data.to
        )
    }

    @Get('commission/:creditAsset')
    getCommission(
        @Param('creditAsset') creditAsset: AddressLike
    ) {
        this.accountingService.getCommission(creditAsset)
    }
}
