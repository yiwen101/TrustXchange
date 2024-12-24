import dotenv from 'dotenv';
dotenv.config();

export const signerInfo = [
    {
        publicKey: process.env.SIGNER_INFOS_1_PUBLIC_KEY,
        privateKey: process.env.SIGNER_INFOS_1_PRIVATE_KEY,
        classicAddress: process.env.SIGNER_INFOS_1_CLASSIC_ADDRESS,
        seed: process.env.SIGNER_INFOS_1_SEED,
    },
    {
        publicKey: process.env.SIGNER_INFOS_2_PUBLIC_KEY,
        privateKey: process.env.SIGNER_INFOS_2_PRIVATE_KEY,
        classicAddress: process.env.SIGNER_INFOS_2_CLASSIC_ADDRESS,
        seed: process.env.SIGNER_INFOS_2_SEED,
    },
    {
        publicKey: process.env.SIGNER_INFOS_3_PUBLIC_KEY,
        privateKey: process.env.SIGNER_INFOS_3_PRIVATE_KEY,
        classicAddress: process.env.SIGNER_INFOS_3_CLASSIC_ADDRESS,
        seed: process.env.SIGNER_INFOS_3_SEED,
    },
];

export const multisigWalletInfo = signerInfo[0];