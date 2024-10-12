const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.register = async (req, res) => {
  const { username, password, name } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword, name });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: 'Error registering new user' });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, name: user.name }, process.env.JWT_SECRET, {
        expiresIn: '6h',
    });

    res.json({ token });
};
