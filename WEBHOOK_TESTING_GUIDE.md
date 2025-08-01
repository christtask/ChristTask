# 🔔 Webhook Testing Guide

## How to Check if Your Webhook is Working

### 1. **Check Webhook Status**
Visit your webhook status endpoint:
```
https://christtask-backend.onrender.com/api/webhook-status
```

This will show:
- ✅ If the webhook endpoint is running
- ✅ If the webhook secret is configured
- ✅ The webhook URL

### 2. **Test Webhook Configuration**
Visit the test endpoint:
```
https://christtask-backend.onrender.com/api/test-webhook
```

This provides debugging information and instructions.

### 3. **Check Server Logs**
Monitor your backend server logs for webhook events. You should see:
- 🔔 `Webhook received` - When a webhook is received
- ✅ `Webhook signature verified successfully` - If signature is valid
- 📦 `Webhook event type: checkout.session.completed` - Event type
- 🎉 `Checkout completed` - Payment success events

### 4. **Stripe Dashboard Check**
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Find your webhook endpoint
3. Check the "Events" tab for recent deliveries
4. Look for:
   - ✅ Successful deliveries (200 status)
   - ❌ Failed deliveries (4xx/5xx status)

### 5. **Test with Stripe CLI** (Local Testing)
```bash
# Install Stripe CLI
# Then run:
stripe listen --forward-to https://christtask-backend.onrender.com/api/webhook

# In another terminal, trigger a test event:
stripe trigger checkout.session.completed
```

### 6. **Manual Testing Steps**

#### Step 1: Make a Test Payment
1. Go to your payment page
2. Use Stripe test card: `4242 4242 4242 4242`
3. Complete a test payment

#### Step 2: Check for Webhook Events
Look for these console logs in your backend:
```
🔔 Webhook received: { timestamp: "...", signature: "Present", ... }
✅ Webhook signature verified successfully
📦 Webhook event type: checkout.session.completed
🎉 Checkout completed: cs_test_...
👤 Customer: test@example.com
📋 Plan: monthly
💰 Amount: 1199
💳 Payment status: paid
✅ Webhook processed successfully
```

### 7. **Common Issues & Solutions**

#### Issue: "Webhook signature verification failed"
**Solution:**
- Check if `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify the webhook secret in Stripe Dashboard matches your environment variable

#### Issue: "No webhook events received"
**Solution:**
- Verify webhook URL in Stripe Dashboard: `https://christtask-backend.onrender.com/api/webhook`
- Check if your server is accessible
- Ensure webhook is enabled in Stripe Dashboard

#### Issue: "Webhook received but not processed"
**Solution:**
- Check server logs for errors
- Verify event types are handled in the switch statement
- Look for "Unhandled event type" messages

### 8. **Expected Webhook Events**

Your webhook should handle these events:
- `checkout.session.completed` - Payment successful
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changes
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Successful recurring payment
- `invoice.payment_failed` - Failed recurring payment

### 9. **Monitoring Tools**

#### Real-time Monitoring:
```bash
# Watch server logs
curl -s https://christtask-backend.onrender.com/api/webhook-status

# Check webhook configuration
curl -s https://christtask-backend.onrender.com/api/test-webhook
```

#### Stripe Dashboard Monitoring:
- Go to Webhooks section
- Click on your webhook endpoint
- Check "Events" tab for delivery status
- Look for failed deliveries and retry them

### 10. **Production Checklist**

- [ ] Webhook endpoint is accessible
- [ ] Webhook secret is configured
- [ ] All required events are enabled
- [ ] Server can handle webhook load
- [ ] Error handling is implemented
- [ ] Logging is comprehensive
- [ ] Failed webhooks are retried
- [ ] Database updates are handled
- [ ] Email notifications are sent
- [ ] Subscription status is updated

### 11. **Debugging Commands**

```bash
# Check webhook status
curl https://christtask-backend.onrender.com/api/webhook-status

# Test webhook configuration
curl https://christtask-backend.onrender.com/api/test-webhook

# Monitor server logs (if you have access)
# Look for webhook-related console logs
```

### 12. **Success Indicators**

✅ **Webhook is working if you see:**
- Console logs with emojis (🔔, ✅, 🎉, etc.)
- Successful webhook deliveries in Stripe Dashboard
- No failed webhook deliveries
- Payment events are processed correctly
- User subscriptions are updated in database

❌ **Webhook is NOT working if you see:**
- No console logs when payments are made
- Failed webhook deliveries in Stripe Dashboard
- "Webhook signature verification failed" errors
- Missing webhook secret errors
- 404 or 500 errors in webhook deliveries

---

## 🚀 Quick Test

1. **Make a test payment** on your site
2. **Check server logs** for webhook events
3. **Verify in Stripe Dashboard** that webhook was delivered
4. **Confirm user access** is granted after payment

If all steps show success, your webhook is working correctly! 🎉 