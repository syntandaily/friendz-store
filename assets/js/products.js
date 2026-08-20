/**
 * FRIENDZ Static Product Database
 * Virudhunagar, Tamil Nadu
 * 
 * Contains high-end curated collections for Men, Women, Kids, and Footwear.
 * All image paths use the ADD-IMG-* placeholder naming convention.
 */

const PRODUCTS = [
  // --- MEN PRODUCTS ---
  {
    id: "FR-MEN-01",
    name: "Geometric Print Cotton Shirt",
    category: "Shirts",
    gender: "men",
    price: 1899,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Off-White", "Charcoal Grey", "Olive Green"],
    material: "100% Pure Organic Linen",
    description: "An editorial classic tailored from ultra-breathable, premium linen. Features a refined band collar, mother-of-pearl buttons, and a relaxed yet structured fit perfect for warm climates.",
    images: [
      "assets/images/men/s1.webp",
      "assets/images/men/ADD-IMG-MEN-01-ALT.jpg"
    ],
    featured: true,
    newArrival: true,
    collection: "Modern Classics"
  },
  {
    id: "FR-MEN-02",
    name: "Textured Lavender Formal Shirt",
    category: "T-Shirts",
    gender: "men",
    price: 1299,
    sizes: ["M", "L", "XL"],
    colors: ["Classic Navy", "Off-Black", "Heather Grey"],
    material: "100% Extra-Long Staple Supima Cotton",
    description: "Crafted from exceptionally soft yet durable Supima cotton with a structured collar that holds its shape. Features double-knit pique texture and a clean minimal placket.",
    images: [
      "assets/images/men/s2.webp"
    ],
    featured: true,
    newArrival: false,
    collection: "Casual Wear"
  },
  {
    id: "FR-MEN-03",
    name: "Graphic Print Cotton Shirt",
    category: "Jeans",
    gender: "men",
    price: 2499,
    sizes: ["30", "32", "34", "36"],
    colors: ["Indigo Wash", "Charcoal Black"],
    material: "12.5oz Selvedge Stretch Denim",
    description: "Sleek and minimalist, these slim-fit jeans are cut from authentic selvedge-inspired stretch denim. Designed to conform to your shape over time while offering all-day flexibility.",
    images: [
      "assets/images/men/s3.webp"
    ],
    featured: false,
    newArrival: true,
    collection: "Modern Classics"
  },
  {
    id: "FR-MEN-04",
    name: "Blue Abstract Print Slim-Fit Shirt",
    category: "Trousers",
    gender: "men",
    price: 1999,
    sizes: ["30", "32", "34", "36"],
    colors: ["Stone Beige", "Urban Black", "Steel Grey"],
    material: "Polyester-Viscose-Spandex Premium Blend",
    description: "Combining formal tailoring lines with casual stretch comfort. Designed with a clean flat front, side slip pockets, and a hidden elasticated drawstring waist.",
    images: [
      "assets/images/men/s4.webp"
    ],
    featured: false,
    newArrival: false,
    collection: "Formal Wear"
  },
  {
    id: "FR-MEN-05",
    name: "Beige Plaid Cotton Shirt",
    category: "Casual Wear",
    gender: "men",
    price: 3499,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Navy Blue", "Slate Grey"],
    material: "Knit Cotton-Poly Structured Weave",
    description: "An unstructured, lightweight blazer that bridges the gap between formal and casual. Unlined construction allows for maximum comfort and breathability.",
    images: [
      "assets/images/men/s5.webp"
    ],
    featured: true,
    newArrival: true,
    collection: "Casual Wear"
  },
  {
    id: "FR-MEN-06",
    name: "Blue Check Cotton Shirt",
    category: "Ethnic Wear",
    gender: "men",
    price: 2799,
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Mustard Gold", "Crimson Red", "Royal Ivory"],
    material: "Premium Tussar Silk Blend",
    description: "Designed for premium festive celebrations, this luxury kurta features subtle metallic embroidery along the collar and front button placket. Elegant drape and high-end sheen.",
    images: [
      "assets/images/men/s6.webp"
    ],
    featured: false,
    newArrival: false,
    collection: "Ethnic Wear"
  },





  // --- WOMEN PRODUCTS ---
  {
    id: "FR-WOM-01",
    name: "Ivory Anarkali Dress with Embroidered Red Dupatta",
    category: "Kurtis",
    gender: "women",
    price: 3299,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Pastel Rose Pink", "Mint Green", "Soft Ivory"],
    material: "Premium Organza Silk with Cotton Lining",
    description: "A breathtaking kurti set that features delicate hand-painted floral motifs and minimal scalloped borders. Styled with soft organza and straight-fit cotton trousers.",
    images: [
      "assets/images/women/d1.png",
      "assets/images/women/ADD-IMG-WOMEN-01-ALT.jpg"
    ],
    featured: true,
    newArrival: true,
    collection: "Festive Wear"
  },
  {
    id: "FR-WOM-02",
    name: "Maroon Embellished Anarkali Gown Set",
    category: "Tops",
    gender: "women",
    price: 999,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Blush Pink", "Classic Black", "Olive"],
    material: "Viscose-Nylon Super-Soft Ribbed Knit",
    description: "A versatile wardrobe base with a clean square neckline and fitted silhouette. The fine-gauge ribbed texture gives a structured, modern, high-fashion styling option.",
    images: [
      "assets/images/women/d2.png"
    ],
    featured: true,
    newArrival: false,
    collection: "Casual Wear"
  },
  {
    id: "FR-WOM-03",
    name: "Pink Tie-Dye Anarkali Dress with Dupatta",
    category: "Dresses",
    gender: "women",
    price: 2199,
    sizes: ["S", "M", "L", "XL"],
    colors: ["Emerald Green", "Midnight Navy", "Champagne"],
    material: "100% Recycled Polyester Georgette",
    description: "Features elegant micro-pleats that expand beautifully as you move. A cinched tie-waist and high neckline create a stunning silhouette for evening soirées.",
    images: [
      "assets/images/women/d3.png"
    ],
    featured: false,
    newArrival: true,
    collection: "Modern Classics"
  },
  {
    id: "FR-WOM-04",
    name: "Purple Embroidered Anarkali Gown with Dupatta",
    category: "Ethnic Wear",
    gender: "women",
    price: 4999,
    sizes: ["Free Size"],
    colors: ["Coral Pink & Gold", "Classic Red", "Deep Wine"],
    material: "Pure Georgette with Zari Weave",
    description: "An authentic, heritage-inspired saree woven with gold zari thread in intricate floral patterns. Lightweight, elegant drape that radiates timeless confidence.",
    images: [
      "assets/images/women/d4.png"
    ],
    featured: false,
    newArrival: false,
    collection: "Ethnic Wear"
  },
  {
    id: "FR-WOM-05",
    name: "Black Saree with Antique Gold Border",
    category: "Bottom Wear",
    gender: "women",
    price: 1599,
    sizes: ["26", "28", "30", "32"],
    colors: ["Natural Oatmeal", "Urban Black"],
    material: "Linen-Viscose Breathable Blend",
    description: "An elegant wide-leg fit with a flat front panel and elasticated back. Designed to sit high on the waist, creating a flattering leg-lengthening drape.",
    images: [
      "assets/images/women/d5.jpg"
    ],
    featured: false,
    newArrival: false,
    collection: "Casual Wear"
  },
  {
    id: "FR-WOM-06",
    name: "Maroon Saree with Copper Border",
    category: "Casual Wear",
    gender: "women",
    price: 2799,
    sizes: ["S", "M", "L"],
    colors: ["Warm Khaki", "Sand Grey"],
    material: "100% Cotton Twill",
    description: "A high-fashion outer layer featuring double-breasted buttons, tortoise-shell buckle details, and adjustable wrist straps. Lends structured elegance to any outfit.",
    images: [
      "assets/images/women/d6.jpg"
    ],
    featured: true,
    newArrival: true,
    collection: "Modern Classics"
  },






  // --- KIDS PRODUCTS ---
  {
    id: "FR-KID-01",
    name: "Boys Striped T-Shirt & Shorts Set",
    category: "Boys",
    gender: "kids",
    kidGender: "boys",
    price: 799,
    sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"],
    colors: ["Sky Blue Print", "Amber Yellow Print"],
    material: "100% Organic Handblock Cotton",
    description: "Lightweight and incredibly gentle on active skin. Features a classic camp collar, wood buttons, and charming traditional block-print patterns.",
    images: [
      "assets/images/kids/k4.jpg"
    ],
    featured: true,
    newArrival: true,
    collection: "Casual Wear"
  },
  {
    id: "FR-KID-02",
    name: "Girls Black Puff-Sleeve Tiered Dress",
    category: "Girls",
    gender: "kids",
    kidGender: "girls",
    price: 1199,
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"],
    colors: ["Blossom Floral Pink", "Lavender Violet"],
    material: "Soft Georgette with Pure Voile Cotton Lining",
    description: "A whimsical tiered dress with flutter sleeves, dynamic floral prints, and a smooth zipper closure at the back. Crafted for absolute movement and comfort.",
    images: [
      "assets/images/kids/k2.jpg"
    ],
    featured: true,
    newArrival: false,
    collection: "Party Wear"
  },
  {
    id: "FR-KID-03",
    name: "Girls Pink Striped Puff-Sleeve Dress",
    category: "Girls",
    gender: "kids",
    kidGender: "girls",
    price: 999,
    sizes: ["1-2Y", "3-4Y", "5-6Y"],
    colors: ["Sage Green & White", "Mustard & Stripe"],
    material: "100% Cotton French Terry & Soft Knit Inner",
    description: "Features adjustable strap lengths, front patch pockets, and premium metal buckles. Includes a soft knit striped tee underneath for a complete casual look.",
    images: [
      "assets/images/kids/k3.jpg"
    ],
    featured: false,
    newArrival: true,
    collection: "Casual Wear"
  },
 






  // --- FOOTWEAR ---
  {
    id: "FR-SAN-01",
    name: "Black Cross-Strap Slide Footwear",
    category: "Men",
    gender: "sandals",
    price: 1499,
    sizes: ["7", "8", "9", "10", "11"],
    colors: ["Tan Brown", "Classic Black"],
    material: "Full-Grain Leather Upper & Cushioned Suede Footbed",
    description: "Handcrafted criss-cross strap design featuring a breathable suede lining, anatomical arch support, and a durable anti-slip rubber outsole for effortless steps.",
    images: [
      "assets/images/sandals/s1.jpg"
    ],
    featured: true,
    newArrival: true,
    collection: "Casual"
  },
  {
    id: "FR-SAN-02",
    name: "Tan Braided Flat Slides",
    category: "Women",
    gender: "sandals",
    price: 1299,
    sizes: ["5", "6", "7", "8", "9"],
    colors: ["Blush Nude", "Pitch Black", "Tan"],
    material: "Vegan Braided Leather Upper & EVA Soft Cushioning",
    description: "An elegant slip-on slide with a beautiful hand-woven braided strap. A cushioned footbed provides everyday comfort with a minimal and polished look.",
    images: [
      "assets/images/sandals/s2.jpg"
    ],
    featured: true,
    newArrival: false,
    collection: "Fashion"
  },
  {
    id: "FR-SAN-03",
    name: "Tan Espadrille Wedge Footwear",
    category: "Women",
    gender: "sandals",
    price: 1899,
    sizes: ["5", "6", "7", "8"],
    colors: ["Cream Off-White", "Tan"],
    material: "Cork Midsole, Suede Top Cover, Strappy Faux-Leather Upper",
    description: "Offers height and extreme comfort in equal measure. Features an ankle strap with an adjustable metallic buckle and a lightweight contoured cork midsole.",
    images: [
      "assets/images/sandals/s5.jpg"
    ],
    featured: false,
    newArrival: true,
    collection: "Fashion"
  },
  {
    id: "FR-SAN-04",
    name: "Black Adjustable-Strap Sport Footwear",
    category: "Kids",
    gender: "sandals",
    price: 899,
    sizes: ["22", "24", "26", "28", "30"],
    colors: ["Navy Orange", "Rose Pink White"],
    material: "Neoprene Lining, Mesh Upper, Rubber Injected Grip Sole",
    description: "Specially designed for active kids, featuring three adjustable hook-and-loop velcro straps for a secure fit. Water-friendly and highly durable materials.",
    images: [
      "assets/images/sandals/s3.jpg"
    ],
    featured: false,
    newArrival: true,
    collection: "Casual"
  },
  {
    id: "FR-SAN-05",
    name: "Black Buckled Mule Loafers",
    category: "Men",
    gender: "sandals",
    price: 2199,
    sizes: ["7", "8", "9", "10"],
    colors: ["Dark Brown", "Midnight Black"],
    material: "Suede Leather Upper & Cork-Latex Footbed",
    description: "Features an adjustable brass buckle design with an open-back mule structure. The cork footbed molds to the shape of the foot for custom-tailored comfort.",
    images: [
      "assets/images/sandals/s4.jpg"
    ],
    featured: false,
    newArrival: false,
    collection: "Casual"
  }
];

/**
 * Dynamic WhatsApp Link Generator Helper
 * @param {Object} product The product object
 * @param {string} selectedSize The size selected by the customer (optional)
 * @param {string} selectedColor The color selected by the customer (optional)
 * @returns {string} The fully formatted WhatsApp API link
 */
function getWhatsAppLink(product, selectedSize = "", selectedColor = "") {
  const number = "918778967955";
  let message = `Hi Friendz, I'm interested in the ${product.name} (Code: ${product.id}).`;
  
  if (selectedSize) {
    message += ` Size: ${selectedSize}.`;
  }
  if (selectedColor) {
    message += ` Color: ${selectedColor}.`;
  }
  
  message += ` Please share the available sizes, colors and current price (₹${product.price}).`;
  
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Sync products dynamically from backend API if available
 */
async function syncProductsFromBackend() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      // Clear array and push fetched items
      PRODUCTS.length = 0;
      PRODUCTS.push(...data.products);
      document.dispatchEvent(new CustomEvent('friendz:products-updated', { detail: PRODUCTS }));
    }
  } catch (e) {
    console.log('Using static products cache.');
  }
}

// Auto sync on load
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    syncProductsFromBackend();
  });
}

