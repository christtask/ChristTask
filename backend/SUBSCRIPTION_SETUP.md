# Automatic Recurring Subscriptions Setup Guide

## 🚀 Complete Setup for Automatic Billing

This guide will help you set up automatic recurring subscriptions with Stripe.

## 📋 Step 1: Set Up Stripe Products & Prices

### 1. Create Products in Stripe Dashboard:

**Weekly Plan:**
- Go to Stripe Dashboard → Products
- Click "Add Product"
- Name: "ChristTask Weekly Plan"
- Price: £4.50
- Billing: Recurring
- Interval: Week
- Save the **Price ID** (starts with `price_`)

**Monthly Plan:**
- Name: "ChristTask Monthly Plan"
- Price: £11.99
- Billing: Recurring
- Interval: Month
- Save the **Price ID** (starts with `price_`)

### 2. Copy Your Price IDs:
- Weekly Price ID: `price_weekly_xxxxx`
- Monthly Price ID: `price_monthly_xxxxx`

## 🔧 Step 2: Configure Environment Variables

### 1. Create `.env` file in backend directory:
```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Stripe Price IDs (Replace with your actual price IDs)
STRIPE_WEEKLY_PRICE_ID=price_weekly_your_actual_price_id
STRIPE_MONTHLY_PRICE_ID=price_monthly_your_actual_price_id

# Frontend URL
FRONTEND_URL=https://christtask.com
```

### 2. Get Your Stripe Keys:
1. **Go to Stripe Dashboard** → Developers → API Keys
2. **Copy your keys**:
   - Secret key (starts with `sk_live_`)
   - Publishable key (starts with `pk_live_`)

## 🔗 Step 3: Set Up Webhooks

### 1. Create Webhook Endpoint:
1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint**: `https://your-backend-url.com/webhook`
3. **Select events**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy webhook secret** (starts with `whsec_`)

## 🚀 Step 4: Deploy Backend

### 1. Install Dependencies:
```bash
cd backend
npm install
```

### 2. Test Locally:
```bash
npm start
```

### 3. Deploy to Render:
1. **Push to GitHub** (separate backend repository)
2. **Connect to Render**
3. **Set environment variables** in Render dashboard
4. **Deploy**

## ✅ Step 5: Test the Setup

### 1. Test Subscription Creation:
- Go to your payment page
- Complete a test payment
- Check Stripe Dashboard for subscription

### 2. Test Automatic Renewal:
- Wait for the billing period to end
- Verify automatic charge occurs
- Check webhook logs

## 🔄 How Automatic Billing Works

### What Happens Now:
1. ✅ **User pays** → Creates recurring subscription
2. ✅ **Access granted** → User can use the service
3. ✅ **Automatic renewal** → Stripe charges automatically
4. ✅ **Continuous access** → User keeps access until cancelled

### Webhook Events Handled:
- `customer.subscription.created` → New subscription
- `invoice.payment_succeeded` → Successful renewal
- `invoice.payment_failed` → Failed payment (send email)
- `customer.subscription.deleted` → Cancelled subscription

## 🛡️ Security Features

### Built-in Protection:
- ✅ **Payment method saved** → Automatic future charges
- ✅ **Failed payment handling** → Retry logic
- ✅ **Webhook verification** → Secure event processing
- ✅ **Customer management** → Track subscription status

## 📊 Monitoring

### Check Subscription Status:
- **Stripe Dashboard** → Customers → View subscriptions
- **Backend logs** → Monitor webhook events
- **Frontend** → Real-time subscription checks

## 🎯 Benefits

### For Users:
- ✅ **No interruption** → Access continues automatically
- ✅ **Convenient** → No manual renewal needed
- ✅ **Reliable** → Automatic payment processing

### For You:
- ✅ **Predictable revenue** → Regular income stream
- ✅ **Better retention** → Users don't lose access
- ✅ **Automated** → No manual intervention needed

## 🚨 Important Notes

### 1. Price IDs:
- **Replace placeholders** with your actual Stripe price IDs
- **Test mode first** → Use test keys before going live

### 2. Webhooks:
- **Must be HTTPS** → Render provides this
- **Verify signatures** → Already implemented

### 3. Testing:
- **Use test cards** → Stripe provides test card numbers
- **Monitor logs** → Check backend console for events

## 🔧 Troubleshooting

### Common Issues:
1. **Price ID not found** → Check Stripe Dashboard
2. **Webhook failures** → Verify endpoint URL
3. **Payment failures** → Check card details
4. **Subscription not created** → Check backend logs

### Debug Commands:
```bash
# Check backend logs
npm start

# Test webhook locally
stripe listen --forward-to localhost:3000/webhook
```

## ✅ Success Checklist

- [ ] Stripe products created with recurring billing
- [ ] Price IDs copied to environment variables
- [ ] Webhook endpoint configured
- [ ] Backend deployed and running
- [ ] Test subscription created successfully
- [ ] Automatic renewal working
- [ ] Failed payment handling tested

Your automatic recurring subscriptions are now ready! 🎉 