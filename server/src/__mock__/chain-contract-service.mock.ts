import {ChainContractsService} from "../chain-contracts/chain-contracts.service";
import {AccessManager, Accounting, UsdToken, EuroToken} from '@blockchain/contracts';
import {IERC20BaseToken} from '@blockchain/contracts/tokens';
import {MockAccessManagerContract} from "./access-manager-contract.mock";
import {MockAccountingContract} from "./accounting-contract.mock";
import {MockUsdToken} from "./usd.mock";
import {MockEurToken} from "./eur.mock";

export class MockChainContractsService implements Partial<ChainContractsService> {
    accessManagerContract: AccessManager = new MockAccessManagerContract() as unknown as AccessManager;
    accountingContract: Accounting = new MockAccountingContract() as unknown as Accounting;
    getContractAddress = jest.fn();

    get usdContract(): UsdToken {
        return new MockUsdToken() as unknown as UsdToken;
    }

    get euroContract(): EuroToken {
        return new MockEurToken() as unknown as EuroToken;
    }

    getCurrencyContract(currency: string): IERC20BaseToken {
        if (currency === 'usd') {
            return this.usdContract;
        }
        if (currency === 'eur') {
            return this.euroContract;
        }
        throw new Error(`Unknown currency: ${currency}`);
    }
}
