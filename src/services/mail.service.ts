var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'youremail@address.com',
		pass: 'yourpassword',
	},
});
