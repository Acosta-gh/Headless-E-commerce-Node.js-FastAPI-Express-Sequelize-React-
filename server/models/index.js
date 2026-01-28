const { Article } = require('@/models/article.model');
const { User } = require('@/models/user.model');
const { Image } = require('@/models/image.model');
const { Comment } = require('@/models/comment.model');
const { Like } = require('@/models/like.model');
const { Bookmark } = require('@/models/bookmark.model');
const { Category } = require('@/models/category.model');
const { Subscriber } = require('@/models/subscriber.model');
const { Token } = require('@/models/token.model');
const { Order } = require('@/models/order.model');
const { OrderItem } = require('@/models/orderItem.model');
const { PaymentMethod } = require('@/models/paymentMethod.model');

// =====================
// Subscriber ↔ Token
// =====================
Token.belongsTo(Subscriber, { foreignKey: 'subscriberId', as: 'subscriber', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Subscriber.hasMany(Token, { foreignKey: 'subscriberId', as: 'tokens', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// User ↔ Token
// =====================
Token.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Token, { foreignKey: 'userId', as: 'tokens', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// User ↔ Article
// =====================
Article.belongsTo(User, { foreignKey: 'authorId', as: 'author', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Article, { foreignKey: 'authorId', as: 'articles', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Article ↔ Image
// =====================
Image.belongsTo(Article, { foreignKey: 'articleId', as: 'article', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Article.hasMany(Image, { foreignKey: 'articleId', as: 'images', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Article ↔ Comment
// =====================
Comment.belongsTo(Article, { foreignKey: 'articleId', as: 'article', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Article.hasMany(Comment, { foreignKey: 'articleId', as: 'comments', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Comment ↔ User
// =====================
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Comment ↔ Comment (Replies)
// =====================
Comment.belongsTo(Comment, { foreignKey: 'commentId', as: 'parentComment', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Comment.hasMany(Comment, { foreignKey: 'commentId', as: 'replies', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Like ↔ Article
// =====================
Like.belongsTo(Article, { foreignKey: 'articleId', as: 'article', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Article.hasMany(Like, { foreignKey: 'articleId', as: 'likes', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Like ↔ User
// =====================
Like.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Like, { foreignKey: 'userId', as: 'likes', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Like ↔ Comment
// =====================
Like.belongsTo(Comment, { foreignKey: 'commentId', as: 'comment', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Comment.hasMany(Like, { foreignKey: 'commentId', as: 'likes', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Bookmark ↔ Article
// =====================
Bookmark.belongsTo(Article, { foreignKey: 'articleId', as: 'article', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Article.hasMany(Bookmark, { foreignKey: 'articleId', as: 'bookmarks', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Bookmark ↔ User
// =====================
Bookmark.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
User.hasMany(Bookmark, { foreignKey: 'userId', as: 'bookmarks', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

// =====================
// Article ↔ Category (Many-to-Many)
// =====================
Article.belongsToMany(Category, { 
  through: 'ArticleCategories',
  foreignKey: 'articleId',
  otherKey: 'categoryId',
  as: 'categories',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Category.belongsToMany(Article, {
  through: 'ArticleCategories',
  foreignKey: 'categoryId',
  otherKey: 'articleId',
  as: 'articles',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// =====================
// User ↔ Order
// =====================
Order.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

User.hasMany(Order, {
  foreignKey: 'userId',
  as: 'orders',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// =====================
// Order ↔ OrderItem
// =====================
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'items',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

// =====================
// OrderItem ↔ Article 
// =====================
OrderItem.belongsTo(Article, {
  foreignKey: 'productId',
  as: 'product',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

// =====================
// Order ↔ PaymentMethod
// =====================
Order.belongsTo(PaymentMethod, {
  foreignKey: 'paymentMethodId',
  as: 'payment', 
  onDelete: 'RESTRICT', 
  onUpdate: 'CASCADE'
});

PaymentMethod.hasMany(Order, {
  foreignKey: 'paymentMethodId',
  as: 'orders',
  onDelete: 'RESTRICT',
  onUpdate: 'CASCADE'
});

module.exports = {
  Article,
  User,
  Image,
  Comment,
  Like,
  Bookmark,
  Category,
  Subscriber,
  Token,
  Order,
  OrderItem,
  PaymentMethod
};