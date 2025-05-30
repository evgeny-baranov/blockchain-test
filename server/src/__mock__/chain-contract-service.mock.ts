import {ChainContractsService} from "../chain-contracts/chain-contracts.service";
import {AccessManager, Accounting} from '@blockchain/contracts';
import {MockAccessManagerContract} from "./access-manager-contract.mock";
import {MockAccountingContract} from "./accounting-contract.mock";

export class MockChainContractsService implements Partial<ChainContractsService> {
    accessManagerContract: AccessManager = new MockAccessManagerContract() as unknown as AccessManager;
    accountingContract: Accounting = new MockAccountingContract() as unknown as Accounting;
    getContractAddress = jest.fn();
}
