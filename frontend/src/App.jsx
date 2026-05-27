import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import People from './pages/People'
import PersonDetail from './pages/PersonDetail'
import Research from './pages/Research'
import Publications from './pages/Publications'
import Projects from './pages/Projects'
import NewsEvents from './pages/NewsEvents'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import JoinUs from './pages/JoinUs'
import Gallery from './pages/Gallery'
import Links from './pages/Links'
import Sponsors from './pages/Sponsors'
import Testimonials from './pages/Testimonials'
import Contact from './pages/Contact'
import AdminLogin from './admin/Login'
import AdminDashboard from './admin/Dashboard'

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
        <Route path="/people/:id" element={<PersonDetail />} />
        <Route path="/research" element={<Research />} />
        <Route path="/publications" element={<Publications />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/news-events" element={<NewsEvents />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/join-us" element={<JoinUs />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/links" element={<Links />} />
        <Route path="/sponsors" element={<Sponsors />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
    </Routes>
  )
}
