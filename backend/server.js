const http = require('http');
const { getAvailableGreenProducts } = require('./greenProductsService');

const PORT = process.env.PORT || 3001;

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/green-products' && req.method === 'GET') {
    const products = getAvailableGreenProducts();
    res.writeHead(200);
    res.end(JSON.stringify({
      success: true,
      count: products.length,
      products,
    }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ success: false, message: 'Route not found' }));
});

server.listen(PORT, () => {
  console.log(`Green products backend running on http://localhost:${PORT}`);
});
