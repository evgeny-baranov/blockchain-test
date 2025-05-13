import {IsNumber, IsPositive, Min, IsString} from 'class-validator';
import { Type } from 'class-transformer';

export class AuctionStartDto {
    @IsNumber()
    @Type(() => Number)
    @IsPositive()
    auctionLotId!: number;

    @IsString()
    creditCurrency!: string;

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
    @IsPositive()
    duration!: number;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    claimDelay!: number;
}
