import {Test, TestingModule} from '@nestjs/testing';
import {RoleModule} from './role.module';
import {RoleService} from './role.service';
import {RoleController} from './role.controller';

describe('RoleModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        process.env.CHAIN_ID = '31337';

        module = await Test.createTestingModule({
            imports: [RoleModule],
        }).compile();
    });

    it('should compile the module', () => {
        expect(module).toBeDefined();
    });

    it('should provide RoleService', () => {
        const service = module.get<RoleService>(RoleService);
        expect(service).toBeInstanceOf(RoleService);
    });

    it('should provide RoleController', () => {
        const controller = module.get<RoleController>(RoleController);
        expect(controller).toBeInstanceOf(RoleController);
    });
});
