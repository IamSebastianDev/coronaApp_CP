/** @format */

// this file handles storing the user data coming from the post request from the frontend

import { handleRequest } from '../config/mongoConnection_config.mjs';

// import and setup encryption
import crypto from 'crypto';
const algorithm = 'aes-256-cbc';
const key = process.env.ENCRYPT_KEY;
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
	let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
};

const decrypt = (text, key) => {
	let iv = Buffer.from(text.iv, 'hex');
	let encryptedText = Buffer.from(text.encryptedData, 'hex');
	let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
};

const storeGroup = async (req, res) => {
	// get the group
	let group = req.body.group;

	//  for each person in the group, encrypt the name and phone number and email
	group.forEach(async (person) => {
		person.firstName = encrypt(person.firstName);
		person.lastName = encrypt(person.lastName);
		person.phone = encrypt(person.phone);
		person.email = encrypt(person.email);
	});

	// create an object with the show data and the group
	let data = { ...req.body.show, group, timestamp: new Date(Date.now()) };

	try {
		// insert the data into the db
		await handleRequest('coronaDataCP', (col) => col.insertOne(data));

		// send response
		res.status(200).json({ msg: 'success', success: true, data: data });
	} catch (e) {
		res.status(400).json({ msg: e });
	}
};

const decryptPersData = async (req, res) => {
	if (!req.body.key) {
		res.status(400).json({ err: 'No key was supplied.' });
	}
	// decrypt the req data
	const personalData = {
		firstName: decrypt(req.body.firstName, req.body.key),
		lastName: decrypt(req.body.lastName, req.body.key),
		phone: decrypt(req.body.phone, req.body.key),
		email: decrypt(req.body.email, req.body.key),
	};

	// send the decrypted data in the response
	res.status(200).json(personalData);
};

export { storeGroup, decryptPersData };
