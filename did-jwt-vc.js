import { ES256KSigner, hexToBytes } from 'did-jwt';
import { createVerifiableCredentialJwt, createVerifiablePresentationJwt, verifyCredential, verifyPresentation } from 'did-jwt-vc';
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

  const clientDid = 'did:web:soonding.github.io:client_did';

  const issuer = {
    did: chatbotDid,
    signer: signer
  };

  const vcPayload = {
    sub: clientDid,
    nbf: Math.floor(Date.now() / 1000),
    vc: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential'],
      credentialSubject: {
        degree: {
          type: 'BachelorDegree',
          name: 'Baccalauréat en musiques numériques'
        }
      }
    }
  };

  const vcJwt = await createVerifiableCredentialJwt(vcPayload, issuer);
  console.log('//// Verifiable Credential:\n', vcJwt);

  const vpPayload = {
    vp: {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      verifiableCredential: [vcJwt]
    }
  };

  const vpJwt = await createVerifiablePresentationJwt(vpPayload, issuer);
  console.log('\n//// Verifiable Presentation:\n', vpJwt);

  const resolver = new Resolver(customResolver);

  const verifiedVC = await verifyCredential(vcJwt, resolver);
  console.log('//// Verified Credentials:\n', verifiedVC);

  const verifiedVP = await verifyPresentation(vpJwt, resolver);
  console.log('\n//// Verified Presentation:\n', verifiedVP);
}

run().catch((err) => console.error('Unexpected error:', err));

