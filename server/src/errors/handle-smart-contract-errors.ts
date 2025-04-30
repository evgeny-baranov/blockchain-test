import {BadRequestException, InternalServerErrorException} from '@nestjs/common';
import {Interface} from "ethers";

export function handleSmartContractError(contractInterface: Interface, error: any): never {
    if (error.code === 'CALL_EXCEPTION' && error.data) {
        let decoded: { name: string; args: any[] } | null = null;

        try {
            decoded = contractInterface.parseError(error.data) as { name: string; args: any[] };
        } catch {
        }

        if (decoded) {
            throw new BadRequestException({
                statusCode: 400,
                error: decoded.name,
                message: `Smart contract reverted with: ${decoded.name}`,
                args: decoded.args,
            });
        }

        throw new InternalServerErrorException('Smart contract reverted with unknown error');
    }

    throw error;
}
