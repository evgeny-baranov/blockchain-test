import {Controller, Delete, Get, Param, Put} from '@nestjs/common';
import {AllowedService} from './allowed.service';
import {AddressLike} from "ethers";

@Controller('accounting/:container/allowed')
export class AllowedController {
    constructor(
        private readonly allowedService: AllowedService,
    ) {
    }

    @Get("")
    getContainerAllowedTokens(
        @Param("container") container: string,
    ) {
        return this.allowedService.getAllowedTokens(container);
    }

    @Put(":creditAsset")
    addAllowedToken(
        @Param("container") container: string,
        @Param("creditAsset") creditAsset: AddressLike,
    ) {
        this.allowedService.addContainerAllowedToken(
            container,
            creditAsset
        )
    }

    @Delete(":creditAsset")
    removeAllowedToken(
        @Param("container") container: string,
        @Param("creditAsset") creditAsset: AddressLike
    ) {
        this.allowedService.removeAllowedToken(
            container,
            creditAsset
        )
    }
}
