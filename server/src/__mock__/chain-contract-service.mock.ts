import {ChainContractsService} from "../chain-contracts/chain-contracts.service";
import {AccessManager,} from '@blockchain/contracts';
import {MockAccessManagerContract} from "./access-manager-contract.mock";

export class MockChainContractsService implements Partial<ChainContractsService> {
    accessManagerContract: AccessManager =  new MockAccessManagerContract() as unknown as AccessManager;
}
