import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './Home/Home';
import Register from './Register/Register';
import Login from './Login/Login';
import Dashboard from './Dashboard/Dashboard';
import ModuleDetailSwitch from './Modules/ModuleDetailSwitch';
import ModuleMaterialsPage from './Modules/ModuleMaterialsPage';
import ModuleQuizListPage from './Modules/ModuleQuizListPage';
import ModuleQuizResultsPage from './Modules/ModuleQuizResultsPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modules/:moduleId/documents" element={<ModuleMaterialsPage type="document" />} />
          <Route path="/modules/:moduleId/videos" element={<ModuleMaterialsPage type="media" />} />
          <Route path="/modules/:moduleId/quiz/results" element={<ModuleQuizResultsPage />} />
          <Route path="/modules/:moduleId/quiz" element={<ModuleQuizListPage />} />
          <Route path="/modules/:moduleId" element={<ModuleDetailSwitch />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
