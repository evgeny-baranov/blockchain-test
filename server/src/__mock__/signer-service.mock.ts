import {SignerService} from "../signer/signer.service";

export class MockSignerService implements Partial<SignerService> {
    publicAddress = '0xabc123';
}