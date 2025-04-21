import {Body, Controller, Copy, Delete, Get, Param, Put} from '@nestjs/common';
import {AccountingService} from './accounting.service';
import {AddressLike, BigNumberish} from "ethers";

@Controller('accounting')
export class AccountingController {
    constructor(
        private readonly accountingService: AccountingService
    ) {
    }

    @Get(':container')
    getBalance(
        @Param('container') container: AddressLike,
    ) {
        return this.accountingService.getBalance(container);
    }

    @Put(':container/:currency/:amount')
    mintToken(
        @Param('currency') currency: 'usd' | 'eur',
        @Param('container') container: AddressLike,
        @Param('amount') amount: BigNumberish,
    ) {
        return this.accountingService.mintToken(
            container,
            currency,
            amount
        );
    }

    @Delete(':container/:currency/:amount')
    burnToken(
        @Param('currency') currency: 'usd' | 'eur',
        @Param('container') container: AddressLike,
        @Param('amount') amount: BigNumberish,
    ) {
        return this.accountingService.burnToken(
            container,
            currency,
            amount
        );
    }
}
