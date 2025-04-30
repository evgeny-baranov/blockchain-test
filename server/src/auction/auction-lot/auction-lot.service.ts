import {Injectable} from '@nestjs/common';
import {BigNumberish} from "ethers";
import {SignerService} from "../../signer/signer.service";
import {ChainContractsService} from "../../chain-contracts/chain-contracts.service";
import {handleSmartContractError} from "../../errors/handle-smart-contract-errors";

@Injectable()
export class AuctionLotService {
    constructor(
        private readonly signerService: SignerService,
        private readonly chainContractsService: ChainContractsService,
    ) {
    }

    createAuctionLot(uri: string) {
        const auctionLotContract = this.chainContractsService.auctionContract;
        try {
            auctionLotContract.createAuctionLot(
                uri
            );
        } catch (error) {
            handleSmartContractError(auctionLotContract.interface, error);
        }
    }

    async getTokensOfOwner() {
        const address = await this.signerService.getSignerWallet().getAddress();
        const tokenIds: bigint[] = await this.chainContractsService.auctionLotContract.getTokensOfOwner(address);

        return tokenIds.map(id => id.toString());
    }

    async getTokenInfo(tokenId: BigNumberish) {
        const auctionLotContract = this.chainContractsService.auctionLotContract;

        try {
            const [owner, tokenURI, name, symbol, version] = await Promise.all([
                auctionLotContract.ownerOf(tokenId),
                auctionLotContract.tokenURI(tokenId),
                auctionLotContract.name(),
                auctionLotContract.symbol(),
                auctionLotContract.version(),
            ]);

            return {
                tokenId,
                owner,
                tokenURI,
                name,
                symbol,
                version
            };
        } catch (error) {
            handleSmartContractError(auctionLotContract.interface, error);
        }
    }
}
