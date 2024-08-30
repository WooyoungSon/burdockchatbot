import { createJWT, verifyJWT, ES256KSigner, hexToBytes, decodeJWT } from 'did-jwt';
import { Resolver } from 'did-resolver';
import fetch from 'node-fetch';

const customResolver = {
  web: async (did) => {
    const url = `https://soonding.github.io/chatbot_did.json`;
    const response = await fetch(url);
    if (response.ok) {
      const didDocument = await response.json();
      return {
        didResolutionMetadata: {},
        didDocument,
        didDocumentMetadata: {}
      };
    } else {
      throw new Error(`Failed to load DID document from ${url}`);
    }
  }
};

async function run() {
  const key = '24852134397fb76bab0bf063de375d8b8048e33b1c9d3a2777957b1437bc18eb';
  const signer = ES256KSigner(hexToBytes(key));

  const chatbotDid = 'did:web:soonding.github.io:chatbot_did';

  const jwt = await createJWT(
    { aud: chatbotDid, name: 'Chatbot Name' },
    { issuer: chatbotDid, signer },
    { alg: 'ES256K' }
  );

  console.log('JWT:', jwt);
  console.log('JWT Decoded:', decodeJWT(jwt));

  const resolver = new Resolver(customResolver);

  try {
    const { payload } = await verifyJWT(jwt, { resolver, audience: chatbotDid });
    console.log('Verified:', payload);
  } catch (error) {
    console.error('Verification error:', error.message);
  }
}

run().catch((err) => console.error('Unexpected error:', err));

