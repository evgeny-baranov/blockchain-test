import {Body, Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {CommissionService} from './commission.service';
import {AddressLike} from "ethers";

@Controller('accounting/:container/commission')
export class CommissionController {
    constructor(private readonly commissionService: CommissionService) {
    }


    @Delete(":creditAsset/:to")
    withdrawCommission(
        @Param('container') container: AddressLike,
        @Param('to') to: AddressLike,
        @Param("creditAsset") creditAsset: AddressLike
    ) {
        this.commissionService.withdrawCommission(
            container,
            creditAsset,
            to,
        )
    }

    @Get(':creditAsset')
    getCommission(
        @Param('container') container: AddressLike,
        @Param('creditAsset') creditAsset: AddressLike
    ) {
        this.commissionService.getCommission(container, creditAsset)
    }

    @Put()
    updateCommissionPercent(
        @Param('container') container: AddressLike,
        @Body("commissionPercent") commissionPercent: number
    ) {
        this.commissionService.updateCommissionPercent(
            container,
            commissionPercent
        )
    }
}
