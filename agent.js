import { createJWT, verifyJWT, ES256KSigner, hexToBytes, decodeJWT } from 'did-jwt';
import { Resolver } from 'did-resolver';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

console.log('Agent script started');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

console.log('Email transporter configured');

const customResolver = {
  web: async (did) => {
    console.log(`Resolving DID: ${did}`);
    const url = `https://soonding.github.io/client_did.json`;
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

async function monitorAuthentication() {
  console.log('Monitoring authentication...');

  const key = '24852134397fb76bab0bf063de375d8b8048e33b1c9d3a2777957b1437bc18eb';
  const signer = ES256KSigner(hexToBytes(key));

  const chatbotDid = 'did:web:soonding.github.io:chatbot_did';

  const jwt = await createJWT(
    { aud: chatbotDid, name: 'Chatbot Name' },
    { issuer: chatbotDid, signer },
    { alg: 'ES256K' }
  );

  console.log('JWT created:', jwt);

  const resolver = new Resolver(customResolver);

  try {
    const { payload } = await verifyJWT(jwt, { resolver, audience: chatbotDid });
    console.log('Verified:', payload);

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: 'recipient-email@example.com',
      subject: 'DID Authentication Successful',
      text: `The DID authentication for ${payload.name} was successful.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

  } catch (error) {
    console.error('Verification error:', error.message);
  }
}

monitorAuthentication().catch((err) => console.error('Unexpected error:', err));
