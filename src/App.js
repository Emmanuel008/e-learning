import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Register from './Register/Register';
import Login from './Login/Login';
import Dashboard from './Dashboard/Dashboard';
import InnovationManagementModule from './Modules/InnovationManagementModule';
import IpManagementModule from './Modules/IpManagementModule';
import ResearchCommercializationModule from './Modules/ResearchCommercializationModule';
import FundraisingModule from './Modules/FundraisingModule';
import ModuleChapterDetailPage from './Modules/ModuleChapterDetailPage';
import ModuleQuizPage from './Modules/ModuleQuizPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/modules/hmu08001" element={<InnovationManagementModule />} />
          <Route path="/modules/hmu08002" element={<IpManagementModule />} />
          <Route path="/modules/hmu08003" element={<ResearchCommercializationModule />} />
          <Route path="/modules/hmu08004" element={<FundraisingModule />} />
          <Route path="/modules/:moduleCode/chapter/:chapterId" element={<ModuleChapterDetailPage />} />
          <Route path="/modules/:moduleCode/quiz/:chapterId" element={<ModuleQuizPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
