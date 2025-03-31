import {Module} from '@nestjs/common';
import {AccessManagerController} from './access-manager.controller';
import {AccessManagerService} from './access-manager.service';
import {SignerModule} from "../signer/signer.module";

@Module({
    imports: [SignerModule],
    controllers: [AccessManagerController],
    providers: [AccessManagerService]
})
export class AccessManagerModule {
}
