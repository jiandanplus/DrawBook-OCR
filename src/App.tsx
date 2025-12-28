import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WorkbenchLayout from './layouts/WorkbenchLayout';
import Dashboard from './pages/workbench/Dashboard';
import Purchase from './pages/workbench/Purchase';
import Profile from './pages/workbench/Profile';
import ApiKey from './pages/workbench/ApiKey';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import Experience from './pages/Experience';
import Login from './pages/Login';
import About from './pages/About';
import Consulting from './pages/Consulting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/newTrial" element={<Experience />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="/consulting" element={<Consulting />} />

        {/* Workbench Routes */}
        <Route path="/workbench" element={<WorkbenchLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="purchase" element={<Purchase />} />
          <Route path="profile" element={<Profile />} />
          <Route path="apikey" element={<ApiKey />} />
          {/* Default redirect to dashboard */}
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
