import { ES256KSigner, hexToBytes } from 'did-jwt';
import { createVerifiableCredentialJwt, createVerifiablePresentationJwt, verifyCredential, verifyPresentation } from 'did-jwt-vc';
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

  const clientDid = 'did:web:WooyoungSon.github.io:client';

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

