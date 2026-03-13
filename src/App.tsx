import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'
import { Layout } from './components/layout/Layout'
import { HomePage } from './pages/HomePage'
import { StorePage } from './pages/StorePage'
import { CategoryPage } from './pages/CategoryPage'
import { AppDetailPage } from './pages/AppDetailPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { DashboardPage } from './pages/DashboardPage'
import { HowItWorksPage } from './pages/HowItWorksPage'
import { AuthPage } from './pages/AuthPage'

function WithLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<WithLayout><HomePage /></WithLayout>} />
            <Route path="/store" element={<WithLayout><StorePage /></WithLayout>} />
            <Route path="/category/:slug" element={<WithLayout><CategoryPage /></WithLayout>} />
            <Route path="/app/:slug" element={<WithLayout><AppDetailPage /></WithLayout>} />
            <Route path="/cart" element={<WithLayout><CartPage /></WithLayout>} />
            <Route path="/checkout" element={<WithLayout><CheckoutPage /></WithLayout>} />
            <Route path="/dashboard" element={<WithLayout><DashboardPage /></WithLayout>} />
            <Route path="/how-it-works" element={<WithLayout><HowItWorksPage /></WithLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
