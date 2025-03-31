import {Injectable, OnModuleInit} from '@nestjs/common';
import {ethers, SigningKey, Wallet, WebSocketProvider} from "ethers";
import assert from 'assert';

@Injectable()
export class SignerService implements OnModuleInit {
    private provider!: WebSocketProvider;
    private signerPrivateKey!: SigningKey;

    onModuleInit(): void {
        const privateKey = process.env.SIGNER_PRIVATE_KEY;
        const rpcUrl = process.env.BLOCKCHAIN_WS;

        assert(privateKey, 'SIGNER_PRIVATE_KEY is not defined');
        assert(rpcUrl, 'BLOCKCHAIN_WS is not defined');

        this.provider = new WebSocketProvider(rpcUrl);

        this.signerPrivateKey = new SigningKey(privateKey);
    }

    getSignerWallet(): Wallet {
        return new ethers.Wallet(
            this.signerPrivateKey,
            this.provider
        );
    }
}
