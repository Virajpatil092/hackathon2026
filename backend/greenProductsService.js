const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'green_products_mock_data.json');

function loadGreenProductsData() {
  const rawData = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(rawData);
}

function getAvailableGreenProducts() {
  const catalog = loadGreenProductsData();
  return (catalog.products || []).filter((product) => product.status === 'ACTIVE');
}

module.exports = {
  getAvailableGreenProducts,
  loadGreenProductsData,
};
