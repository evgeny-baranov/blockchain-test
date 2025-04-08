import {Injectable} from '@nestjs/common';
import {AddressLike} from "ethers";

@Injectable()
export class CommissionService {
    withdrawCommission(container: AddressLike, creditAsset: AddressLike, to: AddressLike) {

    }

    getCommission(container: AddressLike, creditAsset: AddressLike) {

    }

    updateCommissionPercent(container: AddressLike, commissionPercent: number) {

    }
}
