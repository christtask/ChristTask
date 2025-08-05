import { createRoot } from 'react-dom/client'
import App from './lib/App.tsx'
import './index.css'
import './App.css'
import { AuthProvider } from './hooks/useAuth'

// Debug environment variables
console.log('🔍 ENVIRONMENT DEBUG:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
  NODE_ENV: import.meta.env.MODE,
  BASE_URL: import.meta.env.BASE_URL
});

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
