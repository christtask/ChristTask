const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Stripe Price IDs - Replace with your actual price IDs from Stripe Dashboard
const STRIPE_PRICES = {
  weekly: process.env.STRIPE_WEEKLY_PRICE_ID || 'price_weekly_placeholder',
  monthly: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly_placeholder'
};

// Create recurring subscription
app.post('/create-subscription', async (req, res) => {
  try {
    const { email, userId, plan, paymentMethodId, couponCode } = req.body;
    
    console.log('Creating subscription for:', { email, plan, userId });
    
    // 1. Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('Found existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId || 'no-user-id'
        }
      });
      console.log('Created new customer:', customer.id);
    }
    
    // 2. Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });
    
    // 3. Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // 4. Create subscription with automatic renewal
    const subscriptionData = {
      customer: customer.id,
      items: [{ price: STRIPE_PRICES[plan] }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription' 
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: userId || 'no-user-id',
        plan: plan,
        email: email
      }
    };
    
    // Add coupon if provided
    if (couponCode && couponCode.trim()) {
      subscriptionData.coupon = couponCode.trim();
    }
    
    const subscription = await stripe.subscriptions.create(subscriptionData);
    
    console.log('Subscription created:', subscription.id);
    
    res.json({
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end,
      plan: plan
    });
    
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Check subscription status
app.get('/check-subscription', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });
    
    if (customers.data.length === 0) {
      return res.json({
        hasSubscription: false,
        subscription: null
      });
    }
    
    const customer = customers.data[0];
    
    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });
    
    if (subscriptions.data.length === 0) {
      return res.json({
        hasSubscription: false,
        subscription: null
      });
    }
    
    const subscription = subscriptions.data[0];
    
    res.json({
      hasSubscription: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
        plan: subscription.metadata.plan || 'unknown'
      }
    });
    
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// Webhook handler for subscription events
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  console.log('Webhook event received:', event.type);
  
  switch (event.type) {
    case 'customer.subscription.created':
      console.log('Subscription created:', event.data.object.id);
      break;
      
    case 'customer.subscription.updated':
      console.log('Subscription updated:', event.data.object.id);
      break;
      
    case 'customer.subscription.deleted':
      console.log('Subscription cancelled:', event.data.object.id);
      break;
      
    case 'invoice.payment_succeeded':
      console.log('Payment succeeded for subscription:', event.data.object.subscription);
      break;
      
    case 'invoice.payment_failed':
      console.log('Payment failed for subscription:', event.data.object.subscription);
      // You could send an email to the customer here
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  res.json({ received: true });
});

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 