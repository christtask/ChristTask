require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Stripe = require('stripe');
const axios = require('axios');
const OpenAI = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const rag = require('./lib/rag.js'); // Use JavaScript version

// Local fallback function
function fallback() {
  return "This is a fallback response. The full RAG system is temporarily unavailable.";
}

const app = express();
const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Initialize Pinecone
const pinecone = process.env.PINECONE_API_KEY ? new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
}) : null;

// Configure CORS to allow your frontend domain
app.use(cors({
  origin: [
    'https://christ-task-mu.vercel.app',
    'https://christtask.com',
    'https://www.christtask.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({
    message: 'Backend is running with AI integration - Updated!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    status: 'healthy'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  res.json({
    message: 'Backend API is working!',
    timestamp: new Date().toISOString(),
    endpoints: ['/api/chat', '/api/test-rag', '/api/test-chat']
  });
});

// Test RAG system
app.get('/api/test-rag', async (req, res) => {
  try {
    console.log('🧪 Testing RAG system...');
    
    // Check environment variables
    const envCheck = {
      openai: !!process.env.OPENAI_API_KEY,
      pinecone: !!process.env.PINECONE_API_KEY,
      pineconeIndex: process.env.PINECONE_INDEX_NAME || 'chatbot'
    };
    
    console.log('Environment check:', envCheck);
    
    if (!envCheck.openai || !envCheck.pinecone) {
      return res.json({
        status: 'error',
        message: 'Missing environment variables',
        envCheck
      });
    }
    
    // Test a simple query
    const testQuery = 'What is the Trinity?';
    const ragResponse = await rag.generateRAGResponse(testQuery);
    
    res.json({
      status: 'success',
      message: 'RAG system is working!',
      testQuery,
      response: ragResponse.answer.substring(0, 200) + '...',
      sourcesFound: ragResponse.sources.length,
      envCheck
    });
    
  } catch (error) {
    console.error('❌ RAG test failed:', error);
    res.json({
      status: 'error',
      message: 'RAG test failed',
      error: error.message
    });
  }
});

// Simple chat test endpoint
app.post('/api/test-chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log('🧪 Testing chat with message:', message);
    
    // Check environment variables
    const envCheck = {
      openai: !!process.env.OPENAI_API_KEY,
      pinecone: !!process.env.PINECONE_API_KEY,
      pineconeIndex: process.env.PINECONE_INDEX_NAME || 'chatbot'
    };
    
    console.log('Environment check:', envCheck);
    
    if (!envCheck.openai || !envCheck.pinecone) {
      return res.json({
        status: 'error',
        message: 'Missing environment variables',
        envCheck
      });
    }
    
    // Test RAG response
    const ragResponse = await rag.generateRAGResponse(message);
    
    res.json({
      status: 'success',
      answer: ragResponse.answer,
      sources: ragResponse.sources,
      scriptureReferences: ragResponse.scriptureReferences,
      topic: ragResponse.topic,
      difficulty: ragResponse.difficulty,
      envCheck
    });
    
  } catch (error) {
    console.error('❌ Chat test failed:', error);
    res.json({
      status: 'error',
      message: 'Chat test failed',
      error: error.message
    });
  }
});

// Test webhook endpoint for debugging
app.get('/api/test-webhook', (req, res) => {
  console.log('🧪 Webhook test endpoint called');
  
  const webhookUrl = `${req.protocol}://${req.get('host')}/api/webhook`;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  res.json({
    message: 'Webhook test endpoint',
    webhookUrl: webhookUrl,
    endpointSecret: endpointSecret ? 'Configured' : 'Missing',
    timestamp: new Date().toISOString(),
    instructions: [
      '1. Check Stripe Dashboard > Webhooks',
      '2. Verify endpoint URL matches: ' + webhookUrl,
      '3. Ensure webhook secret is configured',
      '4. Test with Stripe CLI: stripe listen --forward-to ' + webhookUrl,
      '5. Check server logs for webhook events'
    ]
  });
});

// Webhook status endpoint
app.get('/api/webhook-status', (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  res.json({
    status: 'Webhook endpoint is running',
    endpointSecret: endpointSecret ? 'Configured' : 'Missing',
    webhookUrl: `${req.protocol}://${req.get('host')}/api/webhook`,
    timestamp: new Date().toISOString()
  });
});

// Stripe Checkout session creation endpoint
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { plan, email, successUrl, cancelUrl, country } = req.body;

    // Validate required fields
    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }

    // Define plan price IDs from Stripe
    const planPriceIds = {
      weekly: 'price_1ReOQ7FEfjI8S6GYiTNrAvPb', // £4.50
      monthly: 'price_1ReOLjFEfjI8S6GYAe7YSlOt', // £11.99
    };

    const priceId = planPriceIds[plan];
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'link'], // Enable both card and Link payments
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription', // Use subscription mode for recurring payments
      customer_email: email,
      allow_promotion_codes: true, // Enable coupon codes
      billing_address_collection: 'required',
      success_url: successUrl || `${req.headers.origin || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin || 'http://localhost:3000'}/payment`,
      locale: country === 'US' ? 'en' : 'auto', // Set locale based on country
      metadata: {
        plan: plan,
        customer_email: email,
        country: country || 'GB',
      },
      subscription_data: {
        metadata: {
          plan: plan,
          customer_email: email,
          country: country || 'GB',
        },
      },
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    });
  }
});

// Verify Stripe Checkout session endpoint
app.post('/api/verify-session', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Return session data
    res.json({
      sessionId: session.id,
      plan: session.metadata.plan,
      customerEmail: session.customer_email,
      paymentStatus: session.payment_status,
      subscriptionId: session.subscription?.id,
      customerId: session.customer?.id,
      amountTotal: session.amount_total,
      currency: session.currency,
      createdAt: session.created,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ 
      error: 'Failed to verify session',
      details: error.message 
    });
  }
});

// Stripe webhook handler for checkout events
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log('🔔 Webhook received:', {
    timestamp: new Date().toISOString(),
    signature: sig ? 'Present' : 'Missing',
    endpointSecret: endpointSecret ? 'Present' : 'Missing',
    bodyLength: req.body.length
  });

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log('✅ Webhook signature verified successfully');
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('📦 Webhook event type:', event.type);
  console.log('🆔 Event ID:', event.id);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('🎉 Checkout completed:', session.id);
      console.log('👤 Customer:', session.customer_email);
      console.log('📋 Plan:', session.metadata.plan);
      console.log('💰 Amount:', session.amount_total);
      console.log('💳 Payment status:', session.payment_status);
      
      // Here you would typically:
      // 1. Update user subscription in your database
      // 2. Send confirmation email
      // 3. Grant access to premium features
      break;
      
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('📅 Subscription created:', subscription.id);
      console.log('📋 Plan:', subscription.metadata.plan);
      console.log('📅 Current period end:', new Date(subscription.current_period_end * 1000));
      break;
      
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('🔄 Subscription updated:', updatedSubscription.id);
      console.log('📊 Status:', updatedSubscription.status);
      console.log('📅 Current period end:', new Date(updatedSubscription.current_period_end * 1000));
      
      // Handle subscription status changes
      if (updatedSubscription.status === 'active') {
        console.log('✅ Subscription is active');
        // Update user's subscription status in database
      } else if (updatedSubscription.status === 'past_due') {
        console.log('⚠️ Subscription is past due - payment failed');
        // Notify user about payment failure
      } else if (updatedSubscription.status === 'canceled') {
        console.log('❌ Subscription was canceled');
        // Update user's subscription status to expired
      } else if (updatedSubscription.status === 'unpaid') {
        console.log('💸 Subscription is unpaid');
        // Update user's subscription status to expired
      }
      break;
      
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object;
      console.log('🗑️ Subscription deleted:', deletedSubscription.id);
      console.log('📝 Deletion reason:', deletedSubscription.cancellation_reason);
      
      // Update user's subscription status to expired
      // This is the main event for subscription expiration
      break;
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      console.log('💸 Payment failed for invoice:', failedInvoice.id);
      console.log('👤 Customer:', failedInvoice.customer);
      console.log('💰 Amount due:', failedInvoice.amount_due);
      
      // Handle failed payment - subscription will be marked as past_due
      break;
      
    case 'invoice.payment_succeeded':
      const successfulInvoice = event.data.object;
      console.log('✅ Payment succeeded for invoice:', successfulInvoice.id);
      console.log('👤 Customer:', successfulInvoice.customer);
      
      // Handle successful payment - subscription will be marked as active
      break;
      
    default:
      console.log(`❓ Unhandled event type ${event.type}`);
  }

  console.log('✅ Webhook processed successfully');
  res.json({ received: true });
});

// Validate coupon code endpoint
app.post('/validate-coupon', async (req, res) => {
  const { couponCode } = req.body;
  
  if (!couponCode || !couponCode.trim()) {
    return res.status(400).json({ 
      valid: false, 
      error: 'Coupon code is required.' 
    });
  }

  const trimmedCode = couponCode.trim().toUpperCase();
  
  // For now, only SALAMOVIC is valid
  // In production, you'd look this up in your database or Stripe
  if (trimmedCode === 'SALAMOVIC') {
    res.json({ 
      valid: true, 
      code: trimmedCode,
      message: 'Coupon code is valid!' 
    });
  } else {
    res.json({ 
      valid: false, 
      error: 'Invalid coupon code.' 
    });
  }
});

// Create subscription endpoint
app.post('/create-subscription', async (req, res) => {
  const { plan, couponCode, paymentMethodId, email, userId } = req.body;
  
  // Map plan IDs to Stripe price IDs
  const priceMap = {
    weekly: 'price_1ReOQ7FEfjI8S6GYiTNrAvPb',
    monthly: 'price_1ReOLjFEfjI8S6GYAe7YSlOt',
  };
  
  const priceId = priceMap[plan];
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan selected.' });
  }

  if (!paymentMethodId) {
    return res.status(400).json({ error: 'Payment method ID is required.' });
  }

  // Validate payment method ID format
  if (!paymentMethodId.startsWith('pm_')) {
    return res.status(400).json({ 
      error: 'Invalid payment method ID format. Expected format: pm_xxx...' 
    });
  }

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  // Validate coupon code (trim whitespace and check if empty)
  const trimmedCouponCode = couponCode ? couponCode.trim() : '';
  const hasValidCoupon = trimmedCouponCode.length > 0;

  try {
    console.log('🔧 Creating subscription with:', {
      plan,
      email,
      userId,
      paymentMethodId,
      hasValidCoupon,
      couponCode: trimmedCouponCode
    });

    // Create a new customer with email and metadata
    const customer = await stripe.customers.create({
      email: email,
      metadata: {
        supabase_user_id: userId || '',
        signup_email: email
      }
    });
    
    console.log('👤 Created customer:', customer.id);
    
    // Attach the payment method to the customer
    console.log('🔗 Attaching payment method:', paymentMethodId);
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });
    console.log('✅ Payment method attached successfully');

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    // Prepare subscription parameters
    const subscriptionParams = {
      customer: customer.id,
      items: [{ price: priceId }],
      default_payment_method: paymentMethodId,
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        supabase_user_id: userId || '',
        signup_email: email,
        plan: plan
      }
    };

    // Handle promotion code if provided
    if (hasValidCoupon) {
      // For now, use the specific promotion code ID you provided
      // In production, you might want to look this up dynamically
      if (trimmedCouponCode.toUpperCase() === 'SALAMOVIC') {
        subscriptionParams.discounts = [{
          promotion_code: 'promo_1RgTYDFEfjI8S6GYmY5YR8sB'
        }];
      } else {
        return res.status(400).json({ error: 'Invalid promotion code.' });
      }
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create(subscriptionParams);
    
    console.log(`Created customer: ${customer.id} for user: ${userId || 'anonymous'}`);
    if (hasValidCoupon) {
      console.log(`Applied promotion code: ${trimmedCouponCode} (Active: true)`);
    }
    console.log(`Created subscription: ${subscription.id}`);
    
    res.json({ 
      success: true,
      subscriptionId: subscription.id,
      customerId: customer.id,
      status: subscription.status,
      appliedCoupon: hasValidCoupon ? trimmedCouponCode : null
    });
  } catch (err) {
    console.error('Stripe error:', err);
    
    // Provide more specific error messages
    let errorMessage = 'An error occurred while creating your subscription.';
    
    if (err.type === 'StripeCardError') {
      errorMessage = err.message || 'Your card was declined. Please try a different card.';
    } else if (err.type === 'StripeInvalidRequestError') {
      errorMessage = 'Invalid request. Please check your payment details.';
    } else if (err.type === 'StripeAPIError') {
      errorMessage = 'Payment service error. Please try again later.';
    } else if (err.message) {
      errorMessage = err.message;
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  console.log('📨 Received chat request');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  
  const { message } = req.body;
  
  if (!message || !message.trim()) {
    console.log('❌ No message provided');
    return res.status(400).json({ 
      error: 'Message is required.' 
    });
  }

  try {
    console.log('🤖 Processing chat request:', message);
    
    // Check if environment variables are set
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not set');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured' 
      });
    }
    
    if (!process.env.PINECONE_API_KEY) {
      console.error('❌ PINECONE_API_KEY not set');
      return res.status(500).json({ 
        error: 'Pinecone API key not configured' 
      });
    }
    
    // Check if RAG module is available
    if (!rag || typeof rag.generateRAGResponse !== 'function') {
      console.error('❌ RAG module not available');
      return res.status(500).json({ 
        error: 'RAG system not available' 
      });
    }
    
    // --- NEW RAG LOGIC ---
    let ragResponse;
    try {
      console.log('🔍 Calling RAG.generateRAGResponse...');
      ragResponse = await rag.generateRAGResponse(message);
      console.log('✅ RAG response generated successfully');
    } catch (ragError) {
      console.log('⚠️ Main RAG failed, using fallback:', ragError.message);
      console.error('RAG Error details:', ragError);
      ragResponse = {
        answer: fallback(),
        sources: [],
        scriptureReferences: [],
        topic: 'General',
        difficulty: 'Beginner'
      };
      console.log('✅ Fallback RAG response generated');
    }
    
    return res.json({
      answer: ragResponse.answer,
      sources: ragResponse.sources,
      scriptureReferences: ragResponse.scriptureReferences,
      topic: ragResponse.topic,
      difficulty: ragResponse.difficulty,
      timestamp: new Date().toISOString(),
      context: 'Used RAG context'
    });
    // --- END NEW RAG LOGIC ---

    // --- OLD LOGIC (commented out for safety) ---
    /*
    // Check if OpenAI is configured
    if (!openai) {
      return res.status(500).json({ 
        error: 'OpenAI is not configured. Please set OPENAI_API_KEY environment variable.' 
      });
    }

    // Check if Pinecone is configured
    if (!pinecone) {
      return res.status(500).json({ 
        error: 'Pinecone is not configured. Please set PINECONE_API_KEY environment variable.' 
      });
    }

    // Get Pinecone index
    const indexName = process.env.PINECONE_INDEX || 'christian-apologetics';
    const index = pinecone.index(indexName);

    // Search for relevant context in Pinecone
    let context = '';
    try {
      const queryResponse = await index.query({
        vector: [0.1, 0.2, 0.3, 0.4, 0.5], // Placeholder vector - you'll need to generate embeddings
        topK: 3,
        includeMetadata: true,
      });
      
      if (queryResponse.matches && queryResponse.matches.length > 0) {
        context = queryResponse.matches.map(match => match.metadata?.text || '').join(' ');
      }
    } catch (pineconeError) {
      console.error('Pinecone search error:', pineconeError);
      // Continue without context if Pinecone fails
    }

    // Create system prompt for Christian apologetics
    const systemPrompt = `You are a Christian apologetics AI assistant. Your role is to help defend the Christian faith with biblical wisdom, historical evidence, and logical reasoning. 

${context ? `Here is some relevant context: ${context}` : ''}

When answering questions:
1. Use biblical references when appropriate
2. Provide historical and archaeological evidence when relevant
3. Use logical reasoning and philosophical arguments
4. Be respectful and loving in your approach
5. Acknowledge when certain questions may not have definitive answers
6. Focus on building faith rather than just winning arguments

Always respond in a helpful, informative, and Christ-like manner.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response. Please try again.';
    
    res.json({ 
      response: aiResponse,
      timestamp: new Date().toISOString(),
      context: context ? 'Used RAG context' : 'No context available'
    });
    */
    // --- END OLD LOGIC ---
  } catch (error) {
    console.error('❌ Chat error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'An error occurred while processing your message.',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Check subscription status endpoint
app.post('/check-subscription', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    console.log('Checking subscription for email:', email);
    
    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (customers.data.length === 0) {
      console.log('No customer found for email:', email);
      return res.json({ 
        hasSubscription: false, 
        subscription: null 
      });
    }

    const customer = customers.data[0];
    console.log('Found customer:', customer.id);

    // Get all subscriptions for this customer (not just active ones)
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
      status: 'all' // Get all statuses to check for expired/canceled
    });

    if (subscriptions.data.length === 0) {
      console.log('No subscriptions found for customer:', customer.id);
      return res.json({ 
        hasSubscription: false, 
        subscription: null 
      });
    }

    const subscription = subscriptions.data[0];
    console.log('Found subscription:', subscription.id, 'Status:', subscription.status);
    console.log('Current period end:', new Date(subscription.current_period_end * 1000));
    console.log('Current time:', new Date());

    // Check if subscription is actually active and not expired
    const now = Math.floor(Date.now() / 1000);
    const isExpired = subscription.current_period_end < now;
    const isActive = subscription.status === 'active' && !isExpired;
    const isPastDue = subscription.status === 'past_due';
    const isCanceled = subscription.status === 'canceled';
    const isUnpaid = subscription.status === 'unpaid';

    console.log('Subscription analysis:', {
      status: subscription.status,
      isExpired,
      isActive,
      isPastDue,
      isCanceled,
      isUnpaid,
      currentPeriodEnd: subscription.current_period_end,
      now
    });

    // Determine if user has an active subscription
    const hasSubscription = isActive || isPastDue; // Allow past_due as they might fix payment

    res.json({
      hasSubscription,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: subscription.metadata.plan || 'unknown',
        currentPeriodEnd: subscription.current_period_end,
        customerId: customer.id,
        isExpired,
        isPastDue,
        isCanceled,
        isUnpaid
      }
    });

  } catch (err) {
    console.error('Error checking subscription:', err);
    res.status(500).json({ error: 'Failed to check subscription status.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
}); 