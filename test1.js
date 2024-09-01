const { Verifier } = require('did-jwt-vc');
const express = require('express');
const app = express();
app.use(express.json());

app.post('/request-credential', (req, res) => {
    // 사용자에게 요구하는 속성 명시
    res.send({
        request: "Please provide a VC containing the following attributes: name, email"
    });
});

app.post('/verify-credential', async (req, res) => {
    // 사용자로부터 받은 JWT
    const { jwt } = req.body;
    const verifier = new Verifier();

    try {
        const verifiedCredential = await verifier.verify(jwt);
        console.log('Verified Credential:', verifiedCredential);
        res.send({
            success: true,
            message: "Credential verified successfully!",
            attributes: verifiedCredential.payload.vc.credentialSubject
        });
    } catch (error) {
        console.error('Verification failed:', error);
        res.status(400).send({ success: false, message: "Credential verification failed." });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
