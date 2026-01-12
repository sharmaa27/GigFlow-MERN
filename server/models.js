const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  status: { type: String, default: 'open', enum: ['open', 'assigned', 'completed'] },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const bidSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  price: { type: Number, required: true },
  message: { type: String },
  status: { type: String, default: 'pending', enum: ['pending', 'hired', 'rejected'] }
});

const User = mongoose.model('User', userSchema);
const Gig = mongoose.model('Gig', gigSchema);
const Bid = mongoose.model('Bid', bidSchema);

module.exports = { User, Gig, Bid };