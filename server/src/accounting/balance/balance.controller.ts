import {Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {BalanceService} from './balance.service';
import {AddressLike, BigNumberish} from "ethers/lib.esm";
import {Currency} from "../../types/currency.type";

@Controller('accounting/balance/:container')
export class BalanceController {
    constructor(
        private readonly balanceService: BalanceService
    ) {
    }

    @Get()
    getBalance(
        @Param('container') container: AddressLike,
    ) {
        return this.balanceService.getBalance(container);
    }

    @Put(':currency/:amount')
    mintToken(
        @Param('currency') currency: Currency,
        @Param('container') container: AddressLike,
        @Param('amount') amount: BigNumberish,
    ) {
        return this.balanceService.mintToken(
            container,
            currency,
            amount
        );
    }

    @Delete(':currency/:amount')
    burnToken(
        @Param('currency') currency: Currency,
        @Param('container') container: AddressLike,
        @Param('amount') amount: BigNumberish,
    ) {
        return this.balanceService.burnToken(
            container,
            currency,
            amount
        );
    }
}
