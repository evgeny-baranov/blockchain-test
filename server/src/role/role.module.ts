import {Module} from '@nestjs/common';
import {RoleService} from './role.service';
import {RoleController} from './role.controller';
import {SignerModule} from "../signer/signer.module";

@Module({
    imports: [SignerModule],
    controllers: [RoleController],
    providers: [RoleService],
})
export class RoleModule {
}
