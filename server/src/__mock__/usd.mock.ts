import {UsdToken__factory} from '@blockchain/factories/contracts';
import {UsdToken} from '@blockchain/contracts';

export class MockUsdToken implements Partial<UsdToken> {
    interface = UsdToken__factory.createInterface();
}
