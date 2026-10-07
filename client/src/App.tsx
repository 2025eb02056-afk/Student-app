import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { Header } from './components/layout/Header.js';
import { BottomNav } from './components/layout/BottomNav.js';
import { AIAssistantModal } from './components/ai/AIAssistantModal.js';

// Pages
import { HomePage } from './pages/HomePage.js';
import { FoodPage } from './pages/FoodPage.js';
import { VendorsPage } from './pages/VendorsPage.js';
import { RestaurantDetailPage } from './pages/RestaurantDetailPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { OrderTrackerPage } from './pages/OrderTrackerPage.js';
import { FavoritesPage } from './pages/FavoritesPage.js';
import { NotificationsPage } from './pages/NotificationsPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';

export const App: React.FC = () => {
  const [selectedSpot, setSelectedSpot] = useState<string>('North Quad (Bldg B)');
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);

  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-surface flex flex-col font-body-md text-on-surface antialiased selection:bg-primary-container selection:text-on-primary">
            {/* Top Fixed Header */}
            <Header
              onOpenAIModal={() => setAiModalOpen(true)}
              selectedSpot={selectedSpot}
              onSelectSpot={setSelectedSpot}
            />

            {/* Main Content Area */}
            <main className="flex-1 w-full pt-28 pb-20">
              <Routes>
                {/* Public & Student Routes */}
                <Route
                  path="/"
                  element={
                    <HomePage
                      onOpenAIModal={() => setAiModalOpen(true)}
                      selectedSpot={selectedSpot}
                      onSelectSpot={setSelectedSpot}
                    />
                  }
                />
                <Route path="/food" element={<FoodPage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/vendors/:vendorId" element={<RestaurantDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:orderId" element={<OrderTrackerPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            {/* Bottom Navigation */}
            <BottomNav />

            {/* Global AI Food Advisory Assistant Modal */}
            <AIAssistantModal
              isOpen={aiModalOpen}
              onClose={() => setAiModalOpen(false)}
            />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
