import {Injectable} from '@nestjs/common';
import {AddressLike} from "ethers";

@Injectable()
export class AccountingService {
    withdrawCommission(creditAsset: AddressLike, to: string) {

    }

    getCommission(creditAsset: AddressLike) {

    }

    updateCommissionPercent(commissionPercent: number) {

    }

    addAllowedToken(creditAsset: AddressLike) {

    }

    removeAllowedToken(creditAsset: AddressLike) {

    }
}
