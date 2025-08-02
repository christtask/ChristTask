# 🧪 Payment Testing Checklist

## 📋 Pre-Testing Setup

### ✅ Environment Check
- [ ] Backend is deployed and running
- [ ] Stripe keys are configured (test/live)
- [ ] Webhook endpoints are set up
- [ ] Database is connected

### ✅ Test Data
- [ ] Test card numbers ready
- [ ] Test email addresses ready
- [ ] Browser dev tools open

## 🔄 Test Scenarios

### 1. **Successful Payment Flow**
- [ ] Navigate to payment page
- [ ] Fill out form with valid data
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Submit payment
- [ ] **Expected:** Immediate redirect to chatbot
- [ ] **Expected:** User can access chatbot immediately
- [ ] **Expected:** Bottom navigation appears (mobile)

### 2. **Failed Payment Flow**
- [ ] Use declined card: `4000 0000 0000 0002`
- [ ] Submit payment
- [ ] **Expected:** Error message displayed
- [ ] **Expected:** Form remains on payment page
- [ ] **Expected:** User can retry with different card

### 3. **Authentication Flow**
- [ ] Complete successful payment
- [ ] Log out
- [ ] Log back in with same credentials
- [ ] **Expected:** Direct access to chatbot
- [ ] **Expected:** No payment required again

### 4. **Mobile Testing**
- [ ] Test on mobile device or dev tools
- [ ] Complete payment flow
- [ ] **Expected:** Bottom navigation appears
- [ ] **Expected:** Responsive design works
- [ ] **Expected:** Touch interactions work

### 5. **Backend Integration**
- [ ] Visit `/test-backend` page
- [ ] Run "Test Health" - should pass
- [ ] Run "Test Payment Endpoints" - should pass
- [ ] Run "Test Subscription Creation" - should pass

### 6. **Error Handling**
- [ ] Test with invalid email format
- [ ] Test with weak password
- [ ] Test with expired card
- [ ] Test with insufficient funds card
- [ ] **Expected:** Appropriate error messages

### 7. **Network Issues**
- [ ] Disconnect internet during payment
- [ ] **Expected:** Graceful error handling
- [ ] **Expected:** User can retry

## 🎯 Test Cards

### ✅ Success Cards
```
4242 4242 4242 4242  # Visa (successful)
5555 5555 5555 4444  # Mastercard (successful)
```

### ❌ Failure Cards
```
4000 0000 0000 0002  # Visa (declined)
4000 0000 0000 9995  # Visa (insufficient funds)
4000 0000 0000 9985  # Visa (expired card)
```

## 📱 Mobile-Specific Tests

### TikTok Browser
- [ ] Test payment flow in TikTok app
- [ ] **Expected:** Payment works correctly
- [ ] **Expected:** Navigation appears after payment

### Safari/Chrome Mobile
- [ ] Test payment flow in mobile browsers
- [ ] **Expected:** Stripe elements load properly
- [ ] **Expected:** Form validation works

## 🔍 Debugging Tips

### Check Browser Console
- [ ] Open dev tools (F12)
- [ ] Look for any errors during payment
- [ ] Check network tab for failed requests

### Check Stripe Dashboard
- [ ] Log into Stripe Dashboard
- [ ] Check "Payments" section
- [ ] Verify test payments are recorded

### Check Backend Logs
- [ ] Monitor backend console/logs
- [ ] Check for webhook events
- [ ] Verify subscription creation

## 🚨 Common Issues & Solutions

### Issue: Payment succeeds but no access
**Solution:** Check authentication flow and localStorage

### Issue: Payment fails with 404
**Solution:** Verify backend endpoints are deployed

### Issue: Mobile navigation doesn't appear
**Solution:** Check `showBottomNav` state logic

### Issue: Stripe elements don't load
**Solution:** Verify Stripe keys are correct

## ✅ Success Criteria

- [ ] All test scenarios pass
- [ ] No console errors in production
- [ ] Mobile experience is smooth
- [ ] Error messages are user-friendly
- [ ] Backend logs show successful webhooks
- [ ] Stripe dashboard shows test payments

## 🎉 Ready for Production

Once all tests pass:
- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoints to production URLs
- [ ] Test with real card (small amount)
- [ ] Deploy to production
- [ ] Monitor for 24 hours

---

**Last Updated:** December 2024
**Tested By:** [Your Name]
**Status:** [ ] Complete [ ] In Progress 