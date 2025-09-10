import { v4 as uuidv4 } from 'uuid';



export async function RegisterNewPasskeyWithPRF() {
    try {

        const publicKey: any = {
            challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
            rp: { name: "My App", id: "fluffy-winner-wvw5j99gppx29rxx-8081.app.github.dev" },
            user: {
                id: new TextEncoder().encode("user-id"),
                name: uuidv4(),
                displayName: `User - ${uuidv4()}`,
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }], // ES256
            authenticatorSelection: {
                userVerification: "required",
                residentKey: "required",
            },
            extensions: {
                prf: { eval: { first: new Uint8Array(32) } }, // placeholder for PRF support
            },
            timeout: 60000,
            attestation: "none",
        };

        const credential:any = await navigator.credentials.create({ publicKey });
        // Check if PRF extension is supported and enabled
        if (credential?.getClientExtensionResults?.().prf?.enabled === true) {
            return credential;
        } else {
            throw new Error('PRF extension is missing');

        }

        // Send credential to your server for registration

    } catch (error: any) {
        throw new Error('Failed to create passkey credential: ' + error.message);

    }


}



export async function GetUserPasskeyAssertion(domainSalt: string) {
    const credentialRequestOptions: any = {
        challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
        timeout: 60000,
        rpId: "fluffy-winner-wvw5j99gppx29rxx-8081.app.github.dev",
        userVerification: "required",
        allowCredentials: [/* Registered credential IDs */],
        extensions: {
            prf: {
                eval: {
                    first: new TextEncoder().encode(domainSalt), // Any domain-specific salt
                },
            },
        },
    };

    console.log('GetUserPasskeyAssertion :', credentialRequestOptions);
    const assertion: any = await navigator.credentials.get({ publicKey: credentialRequestOptions });
    console.log('Assertion received:', assertion);
    const prfOutput = assertion?.getClientExtensionResults?.().prf?.results?.first;
    console.log('PRF output:', prfOutput);
    if (!prfOutput) {
        throw new Error('PRF output is missing');
    }

    return prfOutput;
}