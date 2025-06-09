import {EuroToken__factory} from '@blockchain/factories/contracts';
import {EuroToken} from '@blockchain/contracts';

export class MockEurToken implements Partial<EuroToken> {
    interface = EuroToken__factory.createInterface();
}
