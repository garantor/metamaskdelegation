
import { english, generateMnemonic } from "viem/accounts";
import {ethers, Wallet as EtherWalletType} from 'ethers'
import { HDNodeWallet } from 'ethers';
import * as bip39 from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import * as StellarSdk from '@stellar/stellar-sdk';
import { Wallet } from 'xrpl'; 
import { Keypair } from "@solana/web3.js";
import { mnemonicToAccount } from 'viem/accounts';
import { Buffer } from 'buffer';


export type ChainType = 'stellar' | 'xrpl' | 'solana' | 'evm';

export interface ChainKeys {
    publicKey: string;
    privateKey: string;
}

interface AllChainKeys {
    stellar: string;
    xrpl: string;
    solana: string;
    evm: string;
}



export async function generateEncryptedHexMnemonic(keyArray: Uint8Array): Promise<string> {
    try {
        // Initialize Trust Wallet SDK
        const userMnemonic = generateMnemonic(english, 256);


        let data = userMnemonic;
        // never console.log sensitive data in production
        console.log('Trust Wallet SDK initialized with mnemonic:', data);
        // Generate random IV for CBC mode
        // const iv = window.crypto.getRandomValues(new Uint8Array(16));

        let encrypt = await HDNodeWallet.fromPhrase(userMnemonic)
        console.log('Encrypted mnemonic:', encrypt);
        let encrypt2 = await encrypt.encrypt(keyArray)
        console.log('Encrypted mnemonic222:', encrypt2);
        const hexString = ethers.hexlify(ethers.toUtf8Bytes(encrypt2));
        console.log("Hex Encrypted Wallet:", hexString);
        console.log('---------------------------------------------------------------------------');

        return hexString;
        // // Convert hex back to JSON string
        // const jsonString = ethers.toUtf8String(hexString);
        // // Load the wallet
        // // const wallet = await ethers.Wallet.fromEncryptedJson(jsonString, 'password');
        // // console.log('Decrypted wallet:', wallet);

        // // Convert data to Uint8Array
        // const plain = isHexString(data)
        //     ? Buffer.from(data, 'hex')
        //     : Buffer.from(data, 'utf8');

        // // Encrypt - this only returns ciphertext
        // const encrypted = AES.encryptCBC(key, plain, iv, AESPaddingMode.pkcs7);

        // // Combine IV + ciphertext
        // const combined = new Uint8Array(iv.length + encrypted.length);
        // combined.set(iv, 0);           // First 16 bytes = IV
        // combined.set(encrypted, 16);   // Remaining bytes = ciphertext

        // return HexCoding.encode(combined);

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Encryption failed: ${message}`);
    }
}


export async function decryptWithPRF(encryptedHex: string, keyArray: Uint8Array): Promise<HDNodeWallet | EtherWalletType> {
    console.log('Decrypting hex:', encryptedHex, 'with key:', keyArray);
    try {
   
        // Convert hex back to JSON string
        const jsonString = ethers.toUtf8String(encryptedHex);
        // Load the wallet
        const wallet:any = await ethers.Wallet.fromEncryptedJson(jsonString, keyArray);
        console.log('Decrypted wallet:', wallet, 'mnemonic', wallet.mnemonic.phrase);

        return wallet
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Decryption failed: ${message}`);
    }
}


export function GenerateBlockchainKeyFromMnemonic(
    mnemonic: string,
    chain?: ChainType
): ChainKeys | AllChainKeys | null {
    console.log('bip generation ', mnemonic);
    // let validation = bip39.validateMnemonic(mnemonic, wordlist);
    // console.log('Mnemonic validation result:', validation);

    // if (!validation) {
    //     console.error('Invalid mnemonic');
    //     return null;
    // }

    const seed = bip39.mnemonicToSeedSync(mnemonic, "");

    // Generate Stellar keys
    const generateStellarKeys = () => {
        const hdkey = HDKey.fromMasterSeed(seed);
        const stellarPath = "m/44'/148'/0'";
        const stellarDerived:any = hdkey.derive(stellarPath);
        const stellarKeypair = StellarSdk.Keypair.fromRawEd25519Seed(stellarDerived.privateKey!);
        return {
            publicKey: stellarKeypair.publicKey(),
            privateKey: stellarKeypair.secret()
        };
    };

    // Generate XRPL keys
    const generateXrplKeys = () => {
        const xrplWallet = Wallet.fromMnemonic(mnemonic);
        return {
            publicKey: xrplWallet.address,
            privateKey: xrplWallet.privateKey.toString()
        };
    };

    // Generate Solana keys
    const generateSolanaKeys = () => {
        const solanaKeyPair = Keypair.fromSeed(seed.subarray(0, 32));
        return {
            publicKey: solanaKeyPair.publicKey,
            privateKey: Buffer.from(solanaKeyPair.secretKey).toString('hex')
        };
    };

    // Generate EVM keys
    const generateEvmKeys = () => {
        const evmKeyPair:any = mnemonicToAccount(mnemonic);

        console.log('EVM Public Key:', evmKeyPair);
        return {
            publicKey: evmKeyPair.address,
            privateKey: evmKeyPair.privateKey
        };
    };

    // If specific chain requested, return its keys
    if (chain) {
        let keys: ChainKeys | any;
        switch (chain) {
            case 'stellar':
                keys = generateStellarKeys();
                console.log('Stellar Public Key:', keys.publicKey);
                break;
            case 'xrpl':
                keys = generateXrplKeys();
                console.log('XRPL Public Key:', keys.publicKey);
                break;
            case 'solana':
                keys = generateSolanaKeys();
                console.log('Solana Public Key:', keys.publicKey);
                break;
            case 'evm':
                keys = generateEvmKeys();
                console.log('EVM Public Key:', keys.publicKey);
                break;
            default:
                throw new Error(`Unsupported chain: ${chain}`);
        }
        return keys;
    }

    // Otherwise, return all public keys
    const stellarKeys = generateStellarKeys();
    const xrplKeys = generateXrplKeys();
    const solanaKeys = generateSolanaKeys();
    const evmKeys = generateEvmKeys();

    console.log('Stellar Public Key:', stellarKeys.publicKey);
    console.log('XRPL Public Key:', xrplKeys.publicKey);
    console.log('Solana Public Key:', solanaKeys.publicKey);
    console.log('EVM Public Key:', evmKeys.publicKey);

    return {
        stellar: stellarKeys.publicKey,
        xrpl: xrplKeys.publicKey,
        solana: solanaKeys.publicKey,
        evm: evmKeys.publicKey,
    };
}
