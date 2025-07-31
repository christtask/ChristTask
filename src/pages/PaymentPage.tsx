import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStripe, useElements, CardElement, CardNumberElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import countriesRaw from '../data/countries.js';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem
} from '@/components/ui/command';
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

// List of countries that do NOT require postal code
const noPostalCodeCountries = [
  'AE', 'AG', 'AN', 'AO', 'AW', 'BF', 'BI', 'BJ', 'BO', 'BS', 'BW', 'BZ', 'CD', 'CF', 'CG', 'CI', 'CK', 'CM', 'DJ', 'DM', 'ER', 'FJ', 'GD', 'GH', 'GM', 'GQ', 'GY', 'HK', 'IE', 'JM', 'KE', 'KI', 'KM', 'KN', 'KP', 'LC', 'ML', 'MO', 'MR', 'MS', 'MU', 'MW', 'NR', 'NU', 'PA', 'QA', 'RW', 'SB', 'SC', 'SL', 'SO', 'SR', 'ST', 'SY', 'TF', 'TK', 'TL', 'TO', 'TT', 'TV', 'TZ', 'UG', 'VU', 'YE', 'ZA', 'ZW'
];

// Map countries.json data to needed structure
const countries = countriesRaw.map(c => {
  let currencySymbol = '';
  let currencyCode = '';
  if (c.currencies && typeof c.currencies === 'object') {
    const currencyObj = Object.values(c.currencies)[0];
    if (currencyObj && typeof currencyObj === 'object') {
      currencySymbol = (currencyObj as any).symbol || (currencyObj as any).name || '';
    }
    currencyCode = Object.keys(c.currencies)[0] || '';
  }
  const needsPostalCode = c.cca2 === 'US' || c.cca2 === 'GB';
  let postalPlaceholder = '';
  if (c.cca2 === 'US') postalPlaceholder = 'ZIP Code';
  else if (c.cca2 === 'GB') postalPlaceholder = 'Postal Code';
  
  // Set exchange rates for different currencies
  let rate = 1;
  if (c.cca2 === 'US') {
    rate = 1.25; // USD to GBP conversion (approximate)
    currencySymbol = '$';
  } else if (c.cca2 === 'GB') {
    rate = 1; // GBP base
    currencySymbol = '£';
  } else if (c.cca2 === 'CA') {
    rate = 1.70; // CAD to GBP conversion
    currencySymbol = 'C$';
  } else if (c.cca2 === 'AU') {
    rate = 1.90; // AUD to GBP conversion
    currencySymbol = 'A$';
  } else if (c.cca2 === 'DE' || c.cca2 === 'FR' || c.cca2 === 'IT' || c.cca2 === 'ES' || c.cca2 === 'NL' || c.cca2 === 'BE' || c.cca2 === 'AT' || c.cca2 === 'IE' || c.cca2 === 'FI' || c.cca2 === 'PT' || c.cca2 === 'GR' || c.cca2 === 'SI' || c.cca2 === 'CY' || c.cca2 === 'MT' || c.cca2 === 'SK' || c.cca2 === 'EE' || c.cca2 === 'LV' || c.cca2 === 'LT' || c.cca2 === 'LU') {
    rate = 1.15; // EUR to GBP conversion
    currencySymbol = '€';
  } else if (c.cca2 === 'JP') {
    rate = 180; // JPY to GBP conversion
    currencySymbol = '¥';
  } else if (c.cca2 === 'IN') {
    rate = 100; // INR to GBP conversion
    currencySymbol = '₹';
  } else if (c.cca2 === 'BR') {
    rate = 6.20; // BRL to GBP conversion
    currencySymbol = 'R$';
  } else if (c.cca2 === 'MX') {
    rate = 21.50; // MXN to GBP conversion
    currencySymbol = '$';
  } else if (c.cca2 === 'AR') {
    rate = 1200; // ARS to GBP conversion
    currencySymbol = '$';
  } else if (c.cca2 === 'CL') {
    rate = 1100; // CLP to GBP conversion
    currencySymbol = '$';
  } else if (c.cca2 === 'CO') {
    rate = 4800; // COP to GBP conversion
    currencySymbol = '$';
  } else if (c.cca2 === 'PE') {
    rate = 4.50; // PEN to GBP conversion
    currencySymbol = 'S/';
  } else if (c.cca2 === 'ZA') {
    rate = 23.50; // ZAR to GBP conversion
    currencySymbol = 'R';
  } else if (c.cca2 === 'NG') {
    rate = 1800; // NGN to GBP conversion
    currencySymbol = '₦';
  } else if (c.cca2 === 'KE') {
    rate = 180; // KES to GBP conversion
    currencySymbol = 'KSh';
  } else if (c.cca2 === 'GH') {
    rate = 15.50; // GHS to GBP conversion
    currencySymbol = '₵';
  } else if (c.cca2 === 'UG') {
    rate = 4800; // UGX to GBP conversion
    currencySymbol = 'USh';
  } else if (c.cca2 === 'TZ') {
    rate = 3100; // TZS to GBP conversion
    currencySymbol = 'TSh';
  } else if (c.cca2 === 'RW') {
    rate = 1500; // RWF to GBP conversion
    currencySymbol = 'FRw';
  } else if (c.cca2 === 'ET') {
    rate = 65; // ETB to GBP conversion
    currencySymbol = 'Br';
  } else if (c.cca2 === 'SD') {
    rate = 600; // SDG to GBP conversion
    currencySymbol = 'ج.س';
  } else if (c.cca2 === 'EG') {
    rate = 38; // EGP to GBP conversion
    currencySymbol = 'E£';
  } else if (c.cca2 === 'MA') {
    rate = 12.50; // MAD to GBP conversion
    currencySymbol = 'د.م.';
  } else if (c.cca2 === 'TN') {
    rate = 3.80; // TND to GBP conversion
    currencySymbol = 'د.ت';
  } else if (c.cca2 === 'DZ') {
    rate = 135; // DZD to GBP conversion
    currencySymbol = 'د.ج';
  } else if (c.cca2 === 'LY') {
    rate = 6.20; // LYD to GBP conversion
    currencySymbol = 'ل.د';
  } else if (c.cca2 === 'PK') {
    rate = 350; // PKR to GBP conversion
    currencySymbol = '₨';
  } else if (c.cca2 === 'BD') {
    rate = 130; // BDT to GBP conversion
    currencySymbol = '৳';
  } else if (c.cca2 === 'LK') {
    rate = 380; // LKR to GBP conversion
    currencySymbol = 'Rs';
  } else if (c.cca2 === 'NP') {
    rate = 160; // NPR to GBP conversion
    currencySymbol = '₨';
  } else if (c.cca2 === 'MM') {
    rate = 2600; // MMK to GBP conversion
    currencySymbol = 'K';
  } else if (c.cca2 === 'KH') {
    rate = 4800; // KHR to GBP conversion
    currencySymbol = '៛';
  } else if (c.cca2 === 'LA') {
    rate = 21000; // LAK to GBP conversion
    currencySymbol = '₭';
  } else if (c.cca2 === 'VN') {
    rate = 30000; // VND to GBP conversion
    currencySymbol = '₫';
  } else if (c.cca2 === 'TH') {
    rate = 43; // THB to GBP conversion
    currencySymbol = '฿';
  } else if (c.cca2 === 'MY') {
    rate = 5.80; // MYR to GBP conversion
    currencySymbol = 'RM';
  } else if (c.cca2 === 'SG') {
    rate = 1.70; // SGD to GBP conversion
    currencySymbol = 'S$';
  } else if (c.cca2 === 'ID') {
    rate = 19000; // IDR to GBP conversion
    currencySymbol = 'Rp';
  } else if (c.cca2 === 'PH') {
    rate = 70; // PHP to GBP conversion
    currencySymbol = '₱';
  } else if (c.cca2 === 'KR') {
    rate = 1650; // KRW to GBP conversion
    currencySymbol = '₩';
  } else if (c.cca2 === 'CN') {
    rate = 9.20; // CNY to GBP conversion
    currencySymbol = '¥';
  } else if (c.cca2 === 'HK') {
    rate = 9.80; // HKD to GBP conversion
    currencySymbol = 'HK$';
  } else if (c.cca2 === 'TW') {
    rate = 38; // TWD to GBP conversion
    currencySymbol = 'NT$';
  } else if (c.cca2 === 'NZ') {
    rate = 2.05; // NZD to GBP conversion
    currencySymbol = 'NZ$';
  } else if (c.cca2 === 'CH') {
    rate = 1.10; // CHF to GBP conversion
    currencySymbol = 'CHF';
  } else if (c.cca2 === 'NO') {
    rate = 13.50; // NOK to GBP conversion
    currencySymbol = 'kr';
  } else if (c.cca2 === 'SE') {
    rate = 13.20; // SEK to GBP conversion
    currencySymbol = 'kr';
  } else if (c.cca2 === 'DK') {
    rate = 8.70; // DKK to GBP conversion
    currencySymbol = 'kr';
  } else if (c.cca2 === 'PL') {
    rate = 5.20; // PLN to GBP conversion
    currencySymbol = 'zł';
  } else if (c.cca2 === 'CZ') {
    rate = 28.50; // CZK to GBP conversion
    currencySymbol = 'Kč';
  } else if (c.cca2 === 'HU') {
    rate = 420; // HUF to GBP conversion
    currencySymbol = 'Ft';
  } else if (c.cca2 === 'RO') {
    rate = 5.80; // RON to GBP conversion
    currencySymbol = 'lei';
  } else if (c.cca2 === 'BG') {
    rate = 2.25; // BGN to GBP conversion
    currencySymbol = 'лв';
  } else if (c.cca2 === 'HR') {
    rate = 8.50; // HRK to GBP conversion
    currencySymbol = 'kn';
  } else if (c.cca2 === 'RS') {
    rate = 130; // RSD to GBP conversion
    currencySymbol = 'дин';
  } else if (c.cca2 === 'UA') {
    rate = 45; // UAH to GBP conversion
    currencySymbol = '₴';
  } else if (c.cca2 === 'BY') {
    rate = 3.20; // BYN to GBP conversion
    currencySymbol = 'Br';
  } else if (c.cca2 === 'KZ') {
    rate = 580; // KZT to GBP conversion
    currencySymbol = '₸';
  } else if (c.cca2 === 'UZ') {
    rate = 15000; // UZS to GBP conversion
    currencySymbol = 'so'm';
  } else if (c.cca2 === 'KG') {
    rate = 110; // KGS to GBP conversion
    currencySymbol = 'с';
  } else if (c.cca2 === 'TJ') {
    rate = 12.50; // TJS to GBP conversion
    currencySymbol = 'ЅМ';
  } else if (c.cca2 === 'TM') {
    rate = 4.20; // TMT to GBP conversion
    currencySymbol = 'T';
  } else if (c.cca2 === 'AF') {
    rate = 90; // AFN to GBP conversion
    currencySymbol = '؋';
  } else if (c.cca2 === 'IR') {
    rate = 520000; // IRR to GBP conversion
    currencySymbol = '﷼';
  } else if (c.cca2 === 'IQ') {
    rate = 1950; // IQD to GBP conversion
    currencySymbol = 'ع.د';
  } else if (c.cca2 === 'SA') {
    rate = 4.70; // SAR to GBP conversion
    currencySymbol = 'ر.س';
  } else if (c.cca2 === 'AE') {
    rate = 4.60; // AED to GBP conversion
    currencySymbol = 'د.إ';
  } else if (c.cca2 === 'QA') {
    rate = 4.65; // QAR to GBP conversion
    currencySymbol = 'ر.ق';
  } else if (c.cca2 === 'KW') {
    rate = 0.38; // KWD to GBP conversion
    currencySymbol = 'د.ك';
  } else if (c.cca2 === 'BH') {
    rate = 0.47; // BHD to GBP conversion
    currencySymbol = '.د.ب';
  } else if (c.cca2 === 'OM') {
    rate = 0.48; // OMR to GBP conversion
    currencySymbol = 'ر.ع.';
  } else if (c.cca2 === 'JO') {
    rate = 0.89; // JOD to GBP conversion
    currencySymbol = 'د.ا';
  } else if (c.cca2 === 'LB') {
    rate = 89000; // LBP to GBP conversion
    currencySymbol = 'ل.ل';
  } else if (c.cca2 === 'SY') {
    rate = 13000; // SYP to GBP conversion
    currencySymbol = 'ل.س';
  } else if (c.cca2 === 'YE') {
    rate = 250; // YER to GBP conversion
    currencySymbol = '﷼';
  } else if (c.cca2 === 'IL') {
    rate = 4.20; // ILS to GBP conversion
    currencySymbol = '₪';
  } else if (c.cca2 === 'TR') {
    rate = 38; // TRY to GBP conversion
    currencySymbol = '₺';
  } else if (c.cca2 === 'GE') {
    rate = 3.20; // GEL to GBP conversion
    currencySymbol = '₾';
  } else if (c.cca2 === 'AM') {
    rate = 520; // AMD to GBP conversion
    currencySymbol = '֏';
  } else if (c.cca2 === 'AZ') {
    rate = 1.70; // AZN to GBP conversion
    currencySymbol = '₼';
  } else {
    // Fallback for other countries - use USD as default
    rate = 1.25;
    currencySymbol = currencySymbol || '$';
  }
  
  return {
    code: c.cca2,
    name: c.name.common,
    currency: currencySymbol,
    currencyCode: currencyCode,
    rate: rate,
    needsPostalCode,
    postalPlaceholder
  };
});

function getCountryInfo(countryCode: string) {
  return countries.find(c => c.code === countryCode) || countries[0];
}

const PaymentPage = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedCountry, setSelectedCountry] = useState('GB');
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    couponCode: '',
  });
  const [error, setError] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [cardBrand, setCardBrand] = useState('');

  // Subscription plans
  const plans = {
    weekly: {
      name: 'Weekly Plan',
      price: 4.50,
      description: 'Perfect for trying out ChristTask'
    },
    monthly: {
      name: 'Monthly Plan', 
      price: 11.99,
      description: 'Best value for regular users'
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    
    // Format expiry date input
    if (name === 'expiryDate') {
      let formattedValue = value.replace(/\D/g, ''); // Remove non-digits
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      setFormData({
        ...formData,
        [name]: formattedValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleCountryChange = (e: any) => {
    setSelectedCountry(e.target.value);
  };

  // Convert price based on selected country
  const getConvertedPrice = (originalPrice: number) => {
    const countryInfo = getCountryInfo(selectedCountry);
    return (originalPrice * countryInfo.rate).toFixed(2);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validation
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      setError('Enter a valid email.'); 
      setLoading(false); 
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters.'); 
      setLoading(false); 
      return;
    }
    
    console.log('Starting signup process...');
    
    // Test Supabase connection first
    console.log('Testing Supabase connection...');
    console.log('Environment check:');
    console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('- VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
    
    try {
      const { data: testData, error: testError } = await supabase.from('profiles').select('count').limit(1);
      console.log('Connection test result:', { testData, testError });
      if (testError) {
        console.error('Supabase connection failed:', {
          code: testError.code,
          message: testError.message,
          details: testError.details
        });
        setError(`Connection failed: ${testError.message}. Please check your Supabase configuration.`);
        setLoading(false);
        return;
      }
      console.log('Supabase connection successful!');
    } catch (connectionError) {
      console.error('Connection test exception:', connectionError);
      setError('Network error. Please check your internet connection and Supabase project status.');
      setLoading(false);
      return;
    }
    
    // Register user
    let signupData: any = null;
    try {
    const { error: signUpError, data } = await signUp(formData.email, formData.password);
      console.log('Signup result:', { signUpError, data });
      signupData = data;
      
    if (signUpError) {
        console.error('Signup error details:', signUpError);
        setError(signUpError.message || 'Account creation failed.'); 
        setLoading(false); 
        return;
      }
      
      // Check if email confirmation is required
      if (data?.requiresEmailConfirmation) {
        console.log('Email confirmation required, but proceeding with payment...');
        // Don't block the payment - just log it and continue
        // The user can confirm their email later
      }
      
      // Check if we have a valid user
      if (!data?.user?.id) {
        setError('User account was not created properly. Please try again.'); 
        setLoading(false); 
        return;
      }
    } catch (signupException) {
      console.error('Signup exception:', signupException);
      setError('Network error during signup. Please check your internet connection and try again.');
      setLoading(false);
      return;
    }
    if (!stripe || !elements) {
      setError('Stripe has not loaded yet.'); setLoading(false); return;
    }
    try {
      console.log('Stripe elements:', elements);
      const cardElement = elements.getElement(CardElement);
      console.log('Card element found:', cardElement);
      if (!cardElement) throw new Error('Card Element not found');
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card', card: cardElement as any,
      });
      if (paymentMethodError) throw new Error(paymentMethodError.message || 'Failed to create payment method');
      const res = await fetch('https://christtask-backend.onrender.com/create-subscription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          userId: signupData?.user?.id || null, // Pass the user ID from signup
          couponCode: formData.couponCode.trim(),
          plan: selectedPlan,
          paymentMethodId: paymentMethod.id,
          country: selectedCountry,
        }),
      });
      const responseData = await res.json();
      if (res.status !== 200) throw new Error(responseData.error || 'Failed to create subscription');
      
      // Automatically sign in the user after successful payment
      console.log('Payment successful, signing in user...');
      const { error: signInError } = await signIn(formData.email, formData.password);
      
      if (signInError) {
        console.warn('Auto sign-in failed, but payment was successful:', signInError);
        // Don't block the success flow - user can sign in manually later
      } else {
        console.log('User automatically signed in successfully');
      }
      
      // Show success message
      toast({
        title: "Payment Successful!",
        description: "Your account has been created and subscription activated. Redirecting to chatbot...",
      });
      
      // Redirect to chatbot page
      setTimeout(() => {
        navigate('/chatbot');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Payment failed.');
    }
    setLoading(false);
  };

  const cardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        fontSize: '16px',
        color: '#000000',
        '::placeholder': {
          color: '#666666',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
    // Only show card number
    // For Stripe Elements v3, use 'fields' option if available
    // Otherwise, use custom styling to hide icons/labels
    // But for most, CardElement shows all fields, so we use custom inputs for expiry/CVC
    // and set CardElement to show only card number
    // (Stripe does not officially support cardNumberOnly, but we can use custom styling)
    // If you want a true card number only, use the CardNumberElement from @stripe/react-stripe-js
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Left Side - Animated Background */}
      <div className="hidden lg:flex lg:w-2/3 relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
        {/* Animated Gradient Background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.3,
            }}
          />
        ))}

        {/* Wave Animation */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/10 to-transparent"
          animate={{
            clipPath: [
              'polygon(0 100%, 100% 100%, 100% 60%, 0 40%)',
              'polygon(0 100%, 100% 100%, 100% 40%, 0 60%)',
              'polygon(0 100%, 100% 100%, 100% 60%, 0 40%)',
            ],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-4 text-white">
          {/* Logo */}
          <div className="mb-8 mt-12">
            <span className="text-2xl font-bold text-white">ChristTask</span>
          </div>

          {/* Bottom Text */}
          <div className="absolute bottom-32 left-20 right-0 text-center">
            <div className="space-y-1">
              <span className="text-white text-3xl font-normal tracking-wider whitespace-nowrap">
                Master Apologetics <span className="text-purple-400">Today</span>
              </span>
              <div className="text-white text-xs font-light tracking-tight whitespace-nowrap">
                Be equipped to defend Christianity and never stay silent during accusations, Together with 1000+ Christians.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Payment Form */}
      <div className="flex-1 lg:w-1/3 bg-white p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-md mx-auto py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <span className="text-xl font-bold text-slate-800">ChristTask</span>
          </div>

          <div className="space-y-6">


            {/* Plan Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 text-center">Choose Your Plan</h3>
              <div className="grid grid-cols-1 gap-4">
                {Object.entries(plans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === key
                        ? 'border-slate-800 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-slate-800">{plan.name}</h4>
                        <p className="text-sm text-slate-600">{plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-slate-800">
                          {getCountryInfo(selectedCountry).currency || '$'}{getConvertedPrice(plan.price)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {key === 'weekly' ? 'per week' : 'per month'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800">What's included:</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Complete apologetics training
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Defend your faith confidently
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Join 1000+ Christians
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Access to all ChristTask features
                </li>
              </ul>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Collection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Contact Information</h3>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    Email address <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 !bg-white !text-black border-slate-200 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password (min 6 chars)"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="mt-1 !bg-white !text-black border-slate-200 placeholder:text-gray-500"
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>
              )}
              <div className="mb-4 text-red-600 font-semibold text-center">
                You must create an account and pay in one step. Use this email and password to log in and access your subscription.
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Payment Method</h3>
                <div className="space-y-4">
                  {/* Card Element */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700">
                      Card details
                    </Label>
                    <div className="mt-1">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#000000',
                              '::placeholder': {
                                color: '#666666',
                              },
                            },
                            invalid: {
                              color: '#9e2146',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Postal Code */}
                  {getCountryInfo(selectedCountry).needsPostalCode && (
                    <div>
                      <Label htmlFor="postalCode" className="text-sm font-medium text-slate-700">
                        {selectedCountry === 'US' ? 'ZIP Code' : 'Postal Code'}
                      </Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        placeholder={getCountryInfo(selectedCountry).postalPlaceholder || (selectedCountry === 'US' ? 'ZIP Code' : 'Postal Code')}
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        required
                        className="mt-1 bg-white text-black border-slate-200"
                      />
                    </div>
                  )}

                  {/* Country Selection */}
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-slate-700">
                      Country
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="mt-1 w-full px-3 py-2 bg-white text-black border border-slate-200 rounded-md text-left"
                        >
                          {countries.find(c => c.code === selectedCountry)?.name || 'Select country...'}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-[320px]">
                        <Command>
                          <CommandInput
                            placeholder="Search country..."
                            value={countrySearch}
                            onValueChange={setCountrySearch}
                            className="px-3 py-2"
                          />
                          <CommandList className="max-h-60 overflow-y-auto">
                            {countries
                              .filter(country =>
                                country.name.toLowerCase().includes(countrySearch.toLowerCase())
                              )
                              .map(country => (
                                <CommandItem
                                  key={country.code}
                                  value={country.name}
                                  onSelect={() => {
                                    setSelectedCountry(country.code);
                                    setCountrySearch('');
                                    (document.activeElement as HTMLElement)?.blur();
                                  }}
                                  className={selectedCountry === country.code ? 'bg-slate-100' : ''}
                                >
                                  {country.name}
                                </CommandItem>
                              ))}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800">Discount Code (Optional)</h3>
                <div>
                  <Input
                    name="couponCode"
                    type="text"
                    placeholder="Enter coupon code"
                    value={formData.couponCode}
                    onChange={handleInputChange}
                    className="bg-white text-black border-slate-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!stripe || loading || !formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email) || !formData.password || formData.password.length < 6}
                className="w-full h-14 text-lg font-semibold bg-slate-800 hover:bg-slate-700 text-white"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Join Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Payment Methods Info */}
            <div className="text-center space-y-2">
              <p className="text-xs text-slate-500">
                🔒 Secure payment powered by Stripe
              </p>
              <p className="text-xs text-slate-400">
                Pay with card • Coupon codes accepted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 