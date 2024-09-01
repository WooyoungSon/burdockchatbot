import express from 'express';
import { createJWT, verifyJWT, ES256KSigner, hexToBytes, decodeJWT } from 'did-jwt';
import { Resolver } from 'did-resolver';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const customResolver = {
  web: async (did) => {
    const url = `https://wooyoungson.github.io/client_did.json`;
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

app.post('/verify', async (req, res) => {
  const clientJwt = req.body.jwt;
  const chatbotKey = '604df5c4af0bb47e7f1d77c53d312cfce2609edc1de3726c2faff89032a0e303';
  const chatbotSigner = ES256KSigner(hexToBytes(chatbotKey));

  const chatbotDid = 'did:web:WooyoungSon.github.io:chatbot';
  const clientDid = 'did:web:WooyoungSon.github.io:client';

  const resolver = new Resolver(customResolver);

  try {
    const { payload: clientPayload } = await verifyJWT(clientJwt, { resolver, audience: chatbotDid });
    console.log('Client Verified:', clientPayload);

    const serverJwt = await createJWT(
      { aud: clientDid, name: 'AI Chatbot Name' },
      { issuer: chatbotDid, signer: chatbotSigner },
      { alg: 'ES256K' }
    );

    console.log('AI Chatbot JWT:', serverJwt);
    console.log('AI Chatbot JWT Decoded:', decodeJWT(serverJwt));


    res.json({ serverJwt });
  } catch (error) {
    console.error('Client Verification error:', error.message);
    res.status(401).send('Unauthorized');
  }
});

app.listen(3000, () => {
  console.log('AI Chatbot server is running on http://localhost:3000');
});

