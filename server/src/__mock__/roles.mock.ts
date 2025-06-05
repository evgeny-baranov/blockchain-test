import {Roles} from '@blockchain/contracts/AccessManager';

const allRoles = [
    {
        label: "BURNER",
        role: 3n,
        selectors: [
            "0x42966c68",
            "0x42966c68",
            "0x79cc6790"
        ]
    },
    {
        label: "MINTER",
        role: 2n,
        selectors: [
            "0xa0712d68",
            "0x449a52f8",
            "0xd0def521"
        ]
    },
    {
        label: "UPGRADE",
        role: 1n,
        selectors: [
            "0x4f1ef286",
            "0x7f3c2c28"
        ]
    },
    {
        label: "ACCOUNTANT",
        role: 4n,
        selectors: [
            "0x5baafc96",
            "0x4178617f",
            "0x76874e0f",
            "0x90469a9d",
            "0xf4d30e92",
            "0x55ef910a",
            "0x20e152b0",
            "0x5e379797",
            "0xf827166b",
            "0xe9b30d1f",
            "0x9afbca5a",
            "0xea478360",
            "0x3ccfd60b"
        ]
    },
    {
        label: "ADMIN",
        role: 0n,
        selectors: []
    },
    {
        label: "CUSTODIAN",
        role: 5n,
        selectors: [
            "0x55f804b3",
            "0x96b5a755",
            "0x579632a9"
        ]
    }
];

export function mockAllRoles(): Roles.RoleSelectorsStructOutput[] {
    return buildRoles(allRoles);
}

export function buildRoles(roles: {
    label: string;
    role: bigint;
    selectors: string[]
}[]): Roles.RoleSelectorsStructOutput[] {
    return roles.map(role =>
        Object.assign(
            [role.label, role.role, role.selectors] as [string, bigint, string[]],
            role
        )
    );
}