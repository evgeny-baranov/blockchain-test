import {AddressLike} from 'ethers';
import {MockAccessManagerContract} from "./access-manager-contract.mock";

export function mockRevertAccessManagerUnauthorizedAccount(account: AddressLike) {
    const error = new MockAccessManagerContract().interface.encodeErrorResult(
        'AccessManagerUnauthorizedAccount',
        [account, 0n]
    );

    return {
        code: 'CALL_EXCEPTION',
        data: error,
        reason: 'AccessManagerUnauthorizedAccount',
        message: `execution reverted: AccessManagerUnauthorizedAccount(${account})`,
    };
}