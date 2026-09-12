import { AuthProvider } from '@/contexts/AuthContext.js';
import { RouterApp } from '@/router.js';

export default function App() {
  return (
    <AuthProvider>
      <RouterApp />
    </AuthProvider>
  );
}