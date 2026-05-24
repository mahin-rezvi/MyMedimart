// Initialize Firestore using REST API
async function createSampleData() {
  const projectId = 'baazar-mahin';
  const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  
  // Get ID token from user's browser auth
  console.log('📝 Creating sample Firestore collections via REST API...');
  console.log('Note: Make sure you are logged into Firebase Console before running this.');
  
  try {
    // Sample data to create
    const collections = [
      {
        collection: 'categories',
        docs: [
          {
            id: 'electronics',
            data: {
              name: { stringValue: 'Electronics' },
              icon: { stringValue: '💻' },
              isActive: { booleanValue: true },
              createdAt: { timestampValue: new Date().toISOString() },
            }
          },
          {
            id: 'health',
            data: {
              name: { stringValue: 'Health & Wellness' },
              icon: { stringValue: '💊' },
              isActive: { booleanValue: true },
              createdAt: { timestampValue: new Date().toISOString() },
            }
          }
        ]
      },
      {
        collection: 'products',
        docs: [
          {
            id: 'laptop-001',
            data: {
              name: { stringValue: 'Dell XPS 13 Laptop' },
              price: { doubleValue: 89999 },
              category: { stringValue: 'electronics' },
              description: { stringValue: 'High-performance ultrabook with 13-inch display' },
              sku: { stringValue: 'LAPTOP-XPS-13' },
              isActive: { booleanValue: true },
              isFeatured: { booleanValue: true },
              isFlashSale: { booleanValue: false },
              createdAt: { timestampValue: new Date().toISOString() },
            }
          },
          {
            id: 'phone-001',
            data: {
              name: { stringValue: 'Samsung Galaxy S24' },
              price: { doubleValue: 99999 },
              category: { stringValue: 'electronics' },
              description: { stringValue: 'Latest smartphone with advanced camera' },
              sku: { stringValue: 'PHONE-S24' },
              isActive: { booleanValue: true },
              isFeatured: { booleanValue: true },
              isFlashSale: { booleanValue: true },
              createdAt: { timestampValue: new Date().toISOString() },
            }
          }
        ]
      }
    ];

    console.log('\n✅ Sample data structure created!');
    console.log('   - Categories: Electronics, Health & Wellness');
    console.log('   - Products: Dell XPS 13, Samsung Galaxy S24');
    console.log('\n📋 To add this data to your Firestore database:');
    console.log('   1. Open Firebase Console: https://console.firebase.google.com');
    console.log('   2. Go to Firestore Database for project "baazar-mahin"');
    console.log('   3. Manually add the sample documents OR');
    console.log('   4. Use Firebase Admin SDK with proper credentials\n');
    
    console.log('🔐 For now, you can test login with any account - security rules will be enforced in production.\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSampleData();
