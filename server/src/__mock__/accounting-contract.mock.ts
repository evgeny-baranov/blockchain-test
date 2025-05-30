import {Accounting__factory} from '@blockchain/factories/contracts';
import {ICommissionContainer} from '@blockchain/contracts/utils/commission-container';

export class MockAccountingContract {
    containerAllowedTokens = jest.fn().mockResolvedValue([
        ['0xToken1', 'Token1', 'TKN1', 18],
        ['0xToken2', 'Token2', 'TKN2', 6],
    ] as unknown as ICommissionContainer.TokenDataStructOutput[]);
    addContainerAllowedToken = jest.fn();
    removeContainerAllowedToken = jest.fn();

    interface = Accounting__factory.createInterface();
}
