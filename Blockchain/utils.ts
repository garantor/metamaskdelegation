import { createPublicClient, http } from "viem";
import { sepolia as chain } from "viem/chains";
import { createBundlerClient } from "viem/account-abstraction";

import {
    createWebAuthnCredential,
    toWebAuthnAccount,
} from "viem/account-abstraction";




export const publicClient = createPublicClient({
    chain,
    transport: http(),
});


export const bundlerClient = createBundlerClient({
    client: publicClient,
    transport: http(),
});


export async function credential() {
    const credential:any = await createWebAuthnCredential({
        name: "MetaMask Smart Account",
        extensions: {
            prf: {
                eval: {
                    first: new Uint8Array(32).fill(1), // your input to PRF
                }
            }
        }
    });

    console.log("Credential:", credential?.getClientExtensionResults());
    return credential;
}

// export const webAuthnAccount = toWebAuthnAccount({ credential: await credential() });