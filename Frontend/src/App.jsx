import { BrowserRouter as Router } from "react-router-dom";
<<<<<<< HEAD
import Header from "./components/Header";
import RoutesComponent from "./components/routes";
import {SearchProvider} from './components/SearchContext'
=======
import RoutesComponent from "./components/Routes";
import { SearchProvider } from './components/SearchContext';
import AiTutor from './components/ai/AiTutor';

>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
function App() {
  return (
    <SearchProvider>
      <>
<<<<<<< HEAD
      <Header />
      <RoutesComponent /> 
    </>
    </SearchProvider>
    
  );
}

export default App;
=======
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
>>>>>>> 8e873ea79fbc5315d326d9a388dcf797b3f4a90a
