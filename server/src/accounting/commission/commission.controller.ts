import {Controller, Copy, Get, Param, Put} from '@nestjs/common';
import {CommissionService} from './commission.service';
import {AddressLike} from "ethers";

@Controller('accounting/commission/:container')
export class CommissionController {
    constructor(private readonly commissionService: CommissionService) {
    }


    @Copy(":currency/:to")
    withdrawCommission(
        @Param('container') container: string,
        @Param('to') to: AddressLike,
        @Param("currency") currency: string
    ) {
        return this.commissionService.withdrawCommission(
            container,
            currency,
            to,
        )
    }

    @Get(':currency')
    getCommission(
        @Param('container') container: string,
        @Param("currency") currency: string
    ) {
        return this.commissionService.getCommission(container, currency)
    }

    @Get()
    getCommissionPercent(
        @Param('container') container: string,
    ) {
        return this.commissionService.getCommissionPercent(container)
    }

    @Put(":commissionPercent")
    updateCommissionPercent(
        @Param('container') container: string,
        @Param("commissionPercent") commissionPercent: number
    ) {
        return this.commissionService.updateCommissionPercent(
            container,
            commissionPercent
        )
    }
}
