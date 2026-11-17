const http = require('http');
require('dotenv').config();
const { connectDB } = require('./config/db');
const { seedDemoData } = require('./utils/seedData');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Budget = require('./models/Budget');

async function runTests() {
  console.log('--- Starting SmartTrack AI Backend Sanity Verification ---');
  await connectDB();
  await seedDemoData();

  const user = await User.findOne({ email: 'demo@smarttrack.ai' });
  if (!user) throw new Error('Demo user was not seeded properly');
  console.log('✓ Demo user verified:', user.name, user.email);

  const txCount = await Transaction.countDocuments({ user: user._id });
  console.log(`✓ Transactions stored in MongoDB for user: ${txCount}`);
  if (txCount === 0) throw new Error('No transactions found');

  const budgetCount = await Budget.countDocuments({ user: user._id });
  console.log(`✓ Budgets active for user: ${budgetCount}`);

  // Test creating a transaction
  const newTx = await Transaction.create({
    user: user._id,
    title: 'Verification Test Expense',
    amount: 15.50,
    type: 'expense',
    category: 'Food & Dining',
    date: new Date(),
    paymentMethod: 'Credit Card',
  });
  console.log('✓ Transaction creation verified (ID):', newTx._id);

  await Transaction.findByIdAndDelete(newTx._id);
  console.log('✓ Transaction deletion verified');

  console.log('--- ALL BACKEND SMOKE TESTS PASSED 100% ---');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
