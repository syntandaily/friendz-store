const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { dbQuery, initSchema } = require('../database/db');

async function seed() {
  console.log('🌱 Starting Database Seeding Process...');
  await initSchema();

  // 1. Seed Default Admin
  const adminUsername = 'admin';
  const existingAdmin = await dbQuery.get('SELECT * FROM admins WHERE username = ?', [adminUsername]);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await dbQuery.run(
      'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
      [adminUsername, passwordHash]
    );
    console.log('✅ Created Default Admin user: "admin" / password: "admin123"');
  } else {
    console.log('ℹ️ Admin user already exists.');
  }

  // 2. Read products from assets/js/products.js
  const productsFilePath = path.join(__dirname, '../assets/js/products.js');
  if (!fs.existsSync(productsFilePath)) {
    console.error('❌ Could not find products.js file');
    process.exit(1);
  }

  const fileContent = fs.readFileSync(productsFilePath, 'utf8');

  // Extract products array using eval / safe regex extraction
  const arrayStart = fileContent.indexOf('const PRODUCTS = [');
  if (arrayStart === -1) {
    console.error('❌ Could not parse PRODUCTS array from products.js');
    process.exit(1);
  }

  // Use VM / Node context to execute code safely
  const vm = require('vm');
  const sandbox = {};
  vm.createContext(sandbox);
  // Execute code in sandbox
  vm.runInContext(fileContent + '\nthis.PRODUCTS = PRODUCTS;', sandbox);
  const products = sandbox.PRODUCTS;

  if (!Array.isArray(products) || products.length === 0) {
    console.error('❌ No products found in PRODUCTS array');
    process.exit(1);
  }

  console.log(`📦 Found ${products.length} products to seed...`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of products) {
    const existing = await dbQuery.get('SELECT id FROM products WHERE id = ?', [item.id]);

    const sizesJson = JSON.stringify(item.sizes || []);
    const colorsJson = JSON.stringify(item.colors || []);
    const imagesJson = JSON.stringify(item.images || []);

    if (!existing) {
      await dbQuery.run(
        `INSERT INTO products (
          id, name, category, gender, kidGender, price, sizes, colors, material, description, images, featured, newArrival, collection
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.name,
          item.category || '',
          item.gender || '',
          item.kidGender || null,
          item.price || 0,
          sizesJson,
          colorsJson,
          item.material || '',
          item.description || '',
          imagesJson,
          item.featured ? 1 : 0,
          item.newArrival ? 1 : 0,
          item.collection || ''
        ]
      );
      insertedCount++;
    } else {
      await dbQuery.run(
        `UPDATE products SET
          name = ?, category = ?, gender = ?, kidGender = ?, price = ?, sizes = ?, colors = ?, material = ?, description = ?, images = ?, featured = ?, newArrival = ?, collection = ?
        WHERE id = ?`,
        [
          item.name,
          item.category || '',
          item.gender || '',
          item.kidGender || null,
          item.price || 0,
          sizesJson,
          colorsJson,
          item.material || '',
          item.description || '',
          imagesJson,
          item.featured ? 1 : 0,
          item.newArrival ? 1 : 0,
          item.collection || '',
          item.id
        ]
      );
      updatedCount++;
    }
  }

  console.log(`🎉 Seeding complete: ${insertedCount} inserted, ${updatedCount} updated.`);
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding Failed:', err);
  process.exit(1);
});
