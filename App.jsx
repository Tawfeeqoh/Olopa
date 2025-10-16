import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import CreateContract from './pages/CreateContract'
import MyDeals from './pages/MyDeals'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateContract />} />
          <Route path="/deals" element={<MyDeals />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
