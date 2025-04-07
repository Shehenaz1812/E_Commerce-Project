const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

// 🌐 Connect to MongoDB
mongoose.connect("mongodb+srv://shehenaz:JZYlq66oz2WtDXXZ@p5ecommerce.ivzqcob.mongodb.net/");

// 📁 Image Storage
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });
app.post("/upload", upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `/images/${req.file.filename}`
  });
});
app.use('/images', express.static('upload/images'));

// 🔐 JWT Middleware
const fetchuser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send({ errors: "Please authenticate using a valid token" });
  try {
    const data = jwt.verify(token, "secret_ecom");
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: "Please authenticate using a valid token" });
  }
};

// 👤 User Schema
const Users = mongoose.model("Users", {
  name: String,
  email: { type: String, unique: true },
  password: String,
  cartData: {
    type: Object,
    default: {}, // ✅ Default empty cart
  },
  wishlistData: {
    type: Object,
    default: {}, // ✅ Default empty wishlist
  },
  date: { type: Date, default: Date.now() },
});

// 📦 Product Schema
const Product = mongoose.model("Product", {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  size: [{ type: String, required: true }], 
  new_price: Number,
  old_price: Number,
  date: { type: Date, default: Date.now },
  avilable: { type: Boolean, default: true },
});

// 🧾 Order Schema
const Order = mongoose.model("Order", {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  items: [{ productId: Number, quantity: Number }],
  totalPrice: Number,
  orderDate: { type: Date, default: Date.now },
});

// 👋 Root
app.get("/", (req, res) => {
  res.send("Root");
});

// 🔐 Login
app.post('/login', async (req, res) => {
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user && req.body.password === user.password) {
    const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
    success = true;
    return res.json({ success, token });
  }
  res.status(400).json({ success, errors: "Invalid email or password" });
});

// 📝 Sign Up
app.post('/signup', async (req, res) => {
  let success = false;
  let check = await Users.findOne({ email: req.body.email });
  if (check) return res.status(400).json({ success, errors: "Email already exists" });

  let cart = {}, wishlist = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
    wishlist[i] = 0;
  }

  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    password: req.body.password,
    cartData: cart,
    wishlistData: wishlist,
  });
  await user.save();
  const token = jwt.sign({ user: { id: user.id } }, 'secret_ecom');
  success = true;
  res.json({ success, token });
});

// 🛍️ Product APIs
app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  res.send(products.slice(-8));
});

app.get("/popularinwomen", async (req, res) => {
  const products = await Product.find({ category: "women" });
  res.send(products.slice(0, 4));
});

app.post("/relatedproducts", async (req, res) => {
  const products = await Product.find({ category: req.body.category });
  res.send(products.slice(0, 4));
});

// 🛒 Cart APIs
app.post('/addtocart', fetchuser, async (req, res) => {
  let userData = await Users.findById(req.user.id);
  userData.cartData[req.body.itemId] += 1;
  await userData.save();
  res.send("Added");
});

app.post('/removefromcart', fetchuser, async (req, res) => {
  let userData = await Users.findById(req.user.id);
  if (userData.cartData[req.body.itemId] > 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await userData.save();
  res.send("Removed");
});

app.post('/getcart', fetchuser, async (req, res) => {
  const userData = await Users.findById(req.user.id);
  if (!userData) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(userData.cartData);
});

// ❤️ Wishlist APIs
// Save to Wishlist API
app.post("/addToWishlist", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Initialize wishlistData if not present
    if (!user.wishlistData) user.wishlistData = {};

    // If product already in wishlist, remove it (toggle behavior)
    if (user.wishlistData[productId]) {
      delete user.wishlistData[productId];
    } else {
      user.wishlistData[productId] = true;
    }

    await user.save();
    res.json({ message: "Wishlist updated successfully", wishlistData: user.wishlistData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.post("/removefromwishlist", fetchuser, async (req, res) => {
  const { itemId } = req.body;
  const user = await Users.findById(req.user.id);

  user.wishlistData[itemId] = 0;  // Mark as not wished
  await user.save();

  res.json(user.wishlist); // Return updated list
});


// Get Wishlist API
app.get("/getWishlist/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get products from DB using the productIds in wishlistData
    const productIds = Object.keys(user.wishlistData || {});
    const wishlistProducts = await Products.find({ _id: { $in: productIds } });

    res.json(wishlistProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 📦 Add Product (Admin)
app.post("/addproduct", async (req, res) => {
  const all = await Product.find({});
  const id = all.length > 0 ? all[all.length - 1].id + 1 : 1;
  const newProduct = new Product({ ...req.body, id });
  await newProduct.save();
  res.json({ success: true, message: "Product Added" });
});

// 🧾 PLACE ORDER
app.post("/placeorder", fetchuser, async (req, res) => {
  try {
    const { items, totalPrice } = req.body;
    const order = new Order({
      userId: req.user.id,
      items,
      totalPrice
    });
    await order.save();
    res.status(200).json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
});

// 📄 GET USER ORDERS
app.get("/orders", fetchuser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ orderDate: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
