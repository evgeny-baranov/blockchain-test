import {SignerService} from "../signer/signer.service";
import {Wallet} from "ethers";

const mockWallet = {} as unknown as Wallet;
export const mockSignerPublicAddress = '0xdeadbeef00000000000000000000000000000001';

export class MockSignerService implements Partial<SignerService> {
    publicAddress = mockSignerPublicAddress;
    getSignerWallet = jest.fn().mockResolvedValue(mockWallet);
}