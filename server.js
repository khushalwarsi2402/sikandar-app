const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so your Ionic app can fetch data without security errors
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// The actual data we want to send to the frontend
// Notice I used different items/prices than your demo data so you know it's working!
const inventoryData = [
  { id: 1, name: 'Premium Mutton Curry Cut', price: 650 },
  { id: 2, name: 'Chicken Breast Boneless', price: 280 },
  { id: 3, name: 'Fresh Salmon Fillet', price: 950 },
  { id: 4, name: 'Mutton Mince (Keema)', price: 700 }
];

// The endpoint your InventoryService is looking for
app.get('/api/inventory', (req, res) => {
  console.log('Frontend requested the inventory data!');
  
  // We can add a fake 1-second delay so you can actually see your Ionic loading spinner work
  setTimeout(() => {
    res.json(inventoryData);
  }, 1000);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend API is running at http://localhost:${PORT}`);
});