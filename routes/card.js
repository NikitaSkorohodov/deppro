const express = require('express');
const router = express.Router();
const Card = require('../models/card');
const Course = require('../models/products');

// Middleware to set user status in response locals
router.use((req, res, next) => {
  res.locals.user = req.user; // Assuming `req.user` is populated if user is logged in
  next();
});

// Add course to cart
router.post('/add', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }
    const userId = req.user._id;
    const course = await Course.findById(req.body.id);
    await Card.add(userId, course);
    res.redirect('/card');
  } catch (error) {
    console.error('Error adding course to card:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Remove course from cart
router.delete('/remove/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).send('Unauthorized');
    }
    const userId = req.user._id;
    const card = await Card.remove(userId, req.params.id);
    res.status(200).json(card);
  } catch (error) {
    console.error('Error removing course from card:', error);
    res.status(500).json({ error: 'Failed to remove course from card' });
  }
});

// Render cart page
router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/auth/login'); // Redirect to login if not authenticated
    }
    const userId = req.user._id;
    const card = await Card.fetchByUser(userId);
    let totalPrice = 0;

    if (card && card.courses.length > 0) {
      totalPrice = card.courses.reduce((acc, course) => acc + course.price, 0);
    }

    res.render('card', {
      title: 'Корзина',
      isCard: true,
      courses: card ? card.courses : [],
      totalPrice: totalPrice
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
