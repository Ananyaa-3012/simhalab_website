import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import People from './pages/People'
import Alumni from './pages/Alumni'
import Research from './pages/Research'
import ResearchDetail from './pages/ResearchDetail'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Resources from './pages/Resources'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import AdminLogin from './admin/Login'
import AdminDashboard from './admin/Dashboard'

// Helper utility to construct absolute backend image/file URLs for uploaded assets
const NGROK_URL = import.meta.env.VITE_API_URL || ''

export const getUploadUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${NGROK_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard/*" element={<AdminDashboard />} />
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/people" element={<People />} />
        <Route path="/people/alumni" element={<Alumni />} />
        <Route path="/research" element={<Research />} />
        <Route path="/research/:id" element={<ResearchDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />

        {/* Removed routes → 404 */}
        <Route path="/publications" element={<NotFound />} />
        <Route path="/projects" element={<NotFound />} />
        <Route path="/news-events" element={<NotFound />} />
        <Route path="/join-us" element={<NotFound />} />
        <Route path="/links" element={<NotFound />} />
        <Route path="/sponsors" element={<NotFound />} />
        <Route path="/testimonials" element={<NotFound />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}