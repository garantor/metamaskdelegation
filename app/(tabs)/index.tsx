import { Button } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { GetUserPasskeyAssertion, RegisterNewPasskeyWithPRF } from '@/Blockchain/passkeys';
import React from 'react';
import { ChainKeys, decryptWithPRF, GenerateBlockchainKeyFromMnemonic, generateEncryptedHexMnemonic } from '@/Blockchain/utils';
import { ColoredLabel } from '@/components/ColoredLabel';


// Demo showing passkey registration and PRF-based key generation
// In a real app, handle errors, loading states, and secure storage appropriately
// Also, ensure your backend supports WebAuthn with the PRF extension
// and provides necessary challenges and verifies assertions
// This is a simplified example for demonstration purposes only
// Make sure to store the encrypted mnemonic securely on your backend
// and never expose sensitive data in the frontend or console logs sensitive data
// For signing of user transactions/operations decryption of the mnemonic should be done on the client side and private keys should never leave the client device

export default function HomeScreen() {
  const backendSalt = React.useRef('some-random-backend-salt'); // In real app, fetch from backend
  const [isRegSuccessful, setIsRegSuccessful] = React.useState(false);
  const [displayText, setDisplayText] = React.useState<ChainKeys | string>('Register Passkey');

  const getBorderColor = (key: string) => {
    switch (key) {
      case 'stellar': return '#08b5e5';
      case 'xrpl': return '#e6c300';
      case 'solana': return '#9945FF';
      case 'evm': return '#29b6af';
      default: return 'gray';
    }
  };

  async function handleGeneratePRFKey() {
    try {
      // Get user assertion with PRF
      let assertion = await GetUserPasskeyAssertion(backendSalt.current);

      // Convert ArrayBuffer to Uint8Array
      if (assertion) {

        // Convert ArrayBuffer to Uint8Array
        let keyArray: Uint8Array;
        if (assertion instanceof ArrayBuffer) {
          keyArray = new Uint8Array(assertion);
        } else if (assertion instanceof Uint8Array) {
          keyArray = assertion;
        } else {
          throw new Error('Invalid PRF key format. Expected ArrayBuffer or Uint8Array.');
        }


        if (keyArray.length !== 32) {
          throw new Error(`Expected 32-byte key, got ${keyArray.length} bytes`);
        }

        const encryptedStrings = await generateEncryptedHexMnemonic(keyArray);
        try {
          const decryptedMnemonic = await decryptWithPRF(encryptedStrings, keyArray);

          let addresses: any = await GenerateBlockchainKeyFromMnemonic(decryptedMnemonic.mnemonic.phrase);
          setDisplayText(addresses)

          // store user wallet in local storage


          // setUserAddresses(addressList as Record<string, string>);
        } catch (error) {
          console.error('Error loading addresses after registration:', error);
        } finally {
          // setLoadingAddresses(false);
        }

        window.alert('Blockchain wallet created and addresses loaded successfully!');
      }
    } catch (error: any) {
      window.alert('Error during blockchain registration: ' + error.message);
      // setLoadingAddresses(false);
    }
  }


  async function handlePasskeyRegistration() {
    let calling = await RegisterNewPasskeyWithPRF()
    setTimeout(async () => {

      await handleGeneratePRFKey();
      setIsRegSuccessful(true);
    }, 1000);




  }


  return (

    <ThemedView style={{ flex: 1, alignContent: 'center', justifyContent: 'center', padding: 16 }}>
      <ThemedText style={{ textAlign: 'center' }}>Hellow</ThemedText>
      <ThemedView style={{ flex: 1, alignContent: 'center', justifyContent: 'center', padding: 16 }}>
        <Button title='Hellow' onPress={handlePasskeyRegistration} />

        <ThemedView style={{ marginTop: 16, padding: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 }}>

          {isRegSuccessful && Object.entries(displayText).map(([key, value]) => (
            <ColoredLabel
              key={key}
              // Render the key in bold and value normal
              text={
                <ThemedText>
                  <ThemedText style={{ fontWeight: 'bold', textAlign: 'center' }}>{key.toUpperCase()}:</ThemedText> {String(value)}
                </ThemedText>
              }
              borderColor={getBorderColor(key)}
              style={{ marginBottom: 4, opacity: isRegSuccessful ? 1 : 0.5 }}
            />
          ))}

        </ThemedView>


      </ThemedView>
    </ThemedView>

  );
}

