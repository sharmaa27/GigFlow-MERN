const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { User, Gig, Bid } = require('./models');

const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token is not valid" });
    req.userId = user.id;
    next();
  });
};

router.post('/auth/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Register Error:", err); 
    res.status(500).json({ error: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Wrong credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false, 
      sameSite: 'lax' 
    }).json({ message: "Login successful", user: { name: user.name, email: user.email, id: user._id } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/gigs', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'open' };
    if (search) query.title = { $regex: search, $options: 'i' };
    
    const gigs = await Gig.find(query).populate('ownerId', 'name');
    res.json(gigs);
  } catch (err) {
    console.error("Fetch Gigs Error:", err); 
    res.status(500).json({ error: err.message });
  }
});

router.post('/gigs', verifyToken, async (req, res) => {
  try {
    console.log("Received Gig Data:", req.body); 

    const newGig = new Gig({ ...req.body, ownerId: req.userId });
    await newGig.save();
    res.status(201).json(newGig);
  } catch (err) {
    console.error("Post Gig Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/bids', verifyToken, async (req, res) => {
  try {
    const existingBid = await Bid.findOne({ gigId: req.body.gigId, freelancerId: req.userId });
    if (existingBid) return res.status(400).json({ error: "You have already bid on this gig" });

    const newBid = new Bid({ ...req.body, freelancerId: req.userId });
    await newBid.save();
    res.status(201).json(newBid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bids/:gigId', verifyToken, async (req, res) => {
  try {
    const bids = await Bid.find({ gigId: req.params.gigId }).populate('freelancerId', 'name email');
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/bids/:bidId/hire', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const bid = await Bid.findById(req.params.bidId).session(session);
    if (!bid) throw new Error("Bid not found");

    const gig = await Gig.findById(bid.gigId).session(session);
    
    if (gig.ownerId.toString() !== req.userId) {
      throw new Error("You are not the owner of this gig");
    }

    if (gig.status !== 'open') {
      throw new Error("This gig is already closed!");
    }

    gig.status = 'assigned';
    await gig.save({ session });

    bid.status = 'hired';
    await bid.save({ session });

    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } }
    ).session(session);

    await session.commitTransaction();
    res.json({ message: "Hiring successful!" });

  } catch (error) {
    await session.abortTransaction();
    console.error("Hiring Error:", error);
    res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;