import {IsNumber, IsPositive, IsEthereumAddress, Min, IsOptional, IsString} from 'class-validator';
import { Type } from 'class-transformer';

export class StartAuctionDto {
    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    auctionLotId!: number;

    @IsString()
    creditAsset!: string;

    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    creditStartAmount!: number;

    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    creditEndAmount!: number;

    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    bidIncrement!: number;

    @IsNumber()
    @Type(() => Number)
    startTime!: number;

    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    duration!: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    claimDelay!: number;
}
