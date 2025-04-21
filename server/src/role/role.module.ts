import {Module} from '@nestjs/common';
import {RoleService} from './role.service';
import {RoleController} from './role.controller';
import {SignerModule} from "../signer/signer.module";
import {ChainContractsModule} from "../chain-contracts/chain-contracts.module";

@Module({
    imports: [SignerModule, ChainContractsModule],
    controllers: [RoleController],
    providers: [RoleService],
})
export class RoleModule {
}
