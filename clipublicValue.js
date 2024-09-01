import fetch from 'node-fetch';
import fs from 'fs';

const url = `https://wooyoungson.github.io/client_did.json`;

async function fetchAndSavePublicValue() {
  try {
    const response = await fetch(url);
    if (response.ok) {
      const didDocument = await response.json();
      const publicValue = didDocument.verificationMethod[0].publicKeyJwk.Public;
      if (publicValue) {
        fs.writeFile('./clipublicValue.txt', publicValue, (err) => {
          if (err) {
            throw err;
          }
          console.log('Client Public key value has been saved to clipublicValue.txt');
        });
      } else {
        console.log('Public key not found in publicKeyJwk.');
      }
    } else {
      throw new Error(`Failed to load DID document from ${url}`);
    }
  } catch (error) {
    console.error('Error fetching or writing Public key:', error);
  }
}

fetchAndSavePublicValue();
