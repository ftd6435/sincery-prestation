import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { SelectionProvider } from './contexts/SelectionContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { SiteLayout } from './components/layout/SiteLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { RequireAdmin } from './components/admin/RequireAdmin';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Shop } from './pages/Shop';
import { ShopSlug } from './pages/ShopSlug';
import { Partners } from './pages/Partners';
import { News } from './pages/News';
import { NewsArticle } from './pages/NewsArticle';
import { Contact } from './pages/Contact';
import { Selection } from './pages/Selection';
import { QuoteRequest } from './pages/QuoteRequest';
import { OrderRequest } from './pages/OrderRequest';
import { RequestConfirmation } from './pages/RequestConfirmation';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsAndConditions } from './pages/TermsAndConditions';
import { LegalNotice } from './pages/LegalNotice';
import { NotFound } from './pages/NotFound';
import { AdminLogin } from './pages/admin/AdminLogin';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminQuotes } from './pages/admin/AdminQuotes';
import { AdminArticles } from './pages/admin/AdminArticles';
import { AdminPartners } from './pages/admin/AdminPartners';
import { AdminPartnerCategories } from './pages/admin/AdminPartnerCategories';
import { AdminComments } from './pages/admin/AdminComments';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminProfile } from './pages/admin/AdminProfile';

export function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <SelectionProvider>
          <Routes>
            <Route element={<SiteLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/boutique" element={<Shop />} />
              <Route path="/boutique/:slug" element={<ShopSlug />} />
              <Route path="/partenaires" element={<Partners />} />
              <Route path="/actualites" element={<News />} />
              <Route path="/actualites/:slug" element={<NewsArticle />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/ma-selection" element={<Selection />} />
              <Route path="/devis" element={<QuoteRequest />} />
              <Route
                path="/devis/confirmation"
                element={<RequestConfirmation type="devis" />} />
              
              <Route path="/commande" element={<OrderRequest />} />
              <Route
                path="/commande/confirmation"
                element={<RequestConfirmation type="commande" />} />
              
              <Route
                path="/politique-de-confidentialite"
                element={<PrivacyPolicy />} />
              
              <Route
                path="/conditions-generales"
                element={<TermsAndConditions />} />
              
              <Route path="/mentions-legales" element={<LegalNotice />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
              <RequireAdmin>
                  <AdminLayout />
                </RequireAdmin>
              }>
              
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />} />
              
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="produits" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="commandes" element={<AdminOrders />} />
              <Route path="devis" element={<AdminQuotes />} />
              <Route path="actualites" element={<AdminArticles />} />
              <Route path="commentaires" element={<AdminComments />} />
              <Route path="partenaires" element={<AdminPartners />} />
              <Route path="partenaires-categories" element={<AdminPartnerCategories />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="utilisateurs" element={<AdminUsers />} />
              <Route path="parametres" element={<AdminSettings />} />
              <Route path="profil" element={<AdminProfile />} />
            </Route>
          </Routes>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }
            }} />
          
        </SelectionProvider>
      </AdminAuthProvider>
    </BrowserRouter>);

}