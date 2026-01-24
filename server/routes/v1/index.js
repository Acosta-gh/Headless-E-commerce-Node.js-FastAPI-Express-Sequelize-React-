// routes/v1/index.js
const express = require('express');
const router = express.Router();


// ======================================================================
//                      🚪 Importing Route Modules
// ======================================================================
// Import article routes
const articleRoutes = require('@/routes/v1/article.routes');
const userRoutes = require('@/routes/v1/user.routes');
const commentRoutes = require('@/routes/v1/comment.routes');
const tempIdRoutes = require('@/routes/v1/tempid.routes');
const imageRoutes = require('@/routes/v1/image.routes');
const categoryRoutes = require('@/routes/v1/category.routes');
const verifyRoutes = require('@/routes/v1/verify.routes');
const likeRoutes = require('@/routes/v1/like.routes');
const subscriberRoutes = require('@/routes/v1/subscriber.routes');
const authRoutes = require('@/routes/v1/auth.routes');
const mercadopagoRoutes = require('@/routes/v1/mercadopago.routes');
const orderRoutes = require('@/routes/v1/order.routes');


// ======================================================================
//                      🚦 Defining Route Handlers
// ======================================================================
// Use verify routes for any requests to /verify
router.use('/verify', verifyRoutes);
// Use category routes for any requests to /category
router.use('/category', categoryRoutes);
// Use image routes for any requests to /image
router.use('/image', imageRoutes);
// Use temp ID routes for any requests to /tempid
router.use('/tempid', tempIdRoutes);
// Use comment routes for any requests to /comment
router.use('/comment', commentRoutes);
// Use user routes for any requests to /user
router.use('/user', userRoutes);
// Use article routes for any requests to /article
router.use('/article', articleRoutes);
// Use like routes for any requests to /like
router.use('/like', likeRoutes);
// Use subscriber routes for any requests to /subscriber
router.use('/subscriber', subscriberRoutes);
// 
router.use('/auth', authRoutes);

router.use('/mercadopago', mercadopagoRoutes);
router.use('/order',orderRoutes);

// ======================================================================
//                      🗂️  API v1 Base Route
// ======================================================================
// Prefix all routes with /v1 for versioning
router.get('/', (req, res) => res.send('API v1 is running'));

module.exports = router;