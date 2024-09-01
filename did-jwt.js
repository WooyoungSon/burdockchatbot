import { createJWT, verifyJWT, ES256KSigner, hexToBytes, decodeJWT } from 'did-jwt';
import { Resolver } from 'did-resolver';
import fetch from 'node-fetch';

const customResolver = {
  web: async (did) => {
    const url = `https://wooyoungson.github.io/chatbot_did.json`;
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
  const key = '604df5c4af0bb47e7f1d77c53d312cfce2609edc1de3726c2faff89032a0e303';
  const signer = ES256KSigner(hexToBytes(key));

  const chatbotDid = 'did:web:WooyoungSon.github.io:chatbot';

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

