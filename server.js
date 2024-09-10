const http = require('http');
const { connectToDatabase, closeDatabaseConnection } = require('./db/connection');
const ProductController = require('./controllers/productController');

const PORT = process.env.PORT || 3000;

let db;

function createResponse(res) {
  return {
    status: function(statusCode) {
      res.statusCode = statusCode;
      return this;
    },
    json: function(data) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.end(JSON.stringify(data));
    }
  };
}

async function handleRequest(req, res) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', 'https://vehicle-inventory-3.onrender.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.writeHead(204);
    res.end();
    return;
  }

  const productController = new ProductController(db);
  const response = createResponse(res);

  if (req.method === 'POST' && req.url === '/api/products') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      req.body = JSON.parse(body);
      productController.createProduct(req, response);
    });
  } else if (req.method === 'GET' && req.url === '/api/products') {
    productController.listProducts(req, response);
  } else if (req.method === 'POST' && req.url === '/api/products/add-stock') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      req.body = JSON.parse(body);
      productController.addStock(req, response);
    });
  } else if (req.method === 'POST' && req.url === '/api/products/remove-stock') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      req.body = JSON.parse(body);
      productController.removeStock(req, response);
    });
  } else {
    response.status(404).json({ error: 'Not Found' });
  }
}

const server = http.createServer(handleRequest);

async function startServer() {
  try {
    db = await connectToDatabase();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

startServer();