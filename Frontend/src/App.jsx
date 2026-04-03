import { BrowserRouter as Router } from "react-router-dom";
import RoutesComponent from "./components/Routes";
import { SearchProvider } from './components/SearchContext';
import AiTutor from './components/ai/AiTutor';

function App() {
  return (
    <SearchProvider>
      <>
        <RoutesComponent />
        <AiTutor
          feature="tutor"
          placeholder="Ask me about any subject..."
        />
      </>
    </SearchProvider>
  );
}

export default App;