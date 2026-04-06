import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password });
    if (user) {
      const token = generateToken(res, user._id);
      res.status(201).json({ 
        success: true, 
        token,
        user: { _id: user._id, name: user.name, email: user.email }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (err) { next(err); }
};

export const authUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const token = generateToken(res, user._id);
      res.json({ 
        success: true, 
        token,
        user: { _id: user._id, name: user.name, email: user.email }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (err) { next(err); }
};

export const logoutUser = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, secure: true, sameSite: 'none', expires: new Date(0) });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email }});
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (err) { next(err); }
};
