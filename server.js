const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const allowedOrigins = [
  'http://localhost:4200',
  'https://vaasal-kadhavu.vercel.app'
];

// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));
app.use(cors());
app.use(express.json());

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Protected routes
app.get('/api/data', verifyToken, (req, res) => {
  res.json({
    message: 'Data from protected endpoint',
    user: req.user.email,
    timestamp: new Date().toISOString(),
    data: {
      items: ['Item 1', 'Item 2', 'Item 3']
    }
  });
});

app.post('/api/data', verifyToken, (req, res) => {
  const { body } = req;
  res.json({
    message: 'Data received successfully',
    user: req.user.email,
    receivedData: body,
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});

