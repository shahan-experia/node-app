const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

exports.signUp = async (req, res, next) => {
	try {
		const { password, ...body } = { ...req.body };
		body.password = bcrypt.hashSync(password, 12);

		const newUser = await User.create(body);

		req.session.user = newUser;

		res.status(200).json({
			status: 'success',
			data: { user: newUser }
		});
	} catch (error) {
		res.status(400).json({
			status: 'failed',
			message: error.message || error
		});
	}
};

exports.login = async (req, res, next) => {
	try {
		const { username, password } = req.body;

    const user = await User.findOne({username});
    if (!user) {
      return res.status(404).json({
        status: 'failed',
        message: "user not found"
      })
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({
        status: 'failed',
        message: 'Password incorrect'
      })
    }

		req.session.user = user;

		res.status(200).json({
			status: 'success',
			data: { user }
		});
	} catch (error) {
		res.status(400).json({
			status: 'failed',
			message: error.message || error
		});
	}
};
