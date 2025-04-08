import {Body, Controller, Get, Param, Put} from '@nestjs/common';
import {AccountingService} from './accounting.service';
import {AddressLike, BigNumberish} from "ethers";

@Controller('accounting')
export class AccountingController {
    constructor(
        private readonly accountingService: AccountingService
    ) {
    }

    @Get(':container/balance')
    getBalance(
        @Param('container') container: AddressLike,
    ) {
        return this.accountingService.getBalance(container);
    }

    @Put(':currency/mint/')
    mintToken(
        @Param('currency') token: 'usd' | 'eur',
        @Body('to') to: AddressLike,
        @Body('amount') amount: BigNumberish,
    ) {
        return this.accountingService.mintToken(token, to, amount);
    }
}
