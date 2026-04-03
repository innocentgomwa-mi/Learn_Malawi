import { Routes, Route } from "react-router-dom";
import LandingPage from "./Landing_page";
import CareerResources from "../pages/CareerResources";
import PastPapers from "../pages/PastPapers";
import Quizes from "../pages/Quizes";
import StudyNotes from "../pages/StudyNotes";
import Tutorials from "../pages/Tutorials";
import About from "../pages/Abouts";

const RoutesComponent = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/study-notes" element={<StudyNotes />} />
      <Route path="/past-papers" element={<PastPapers />} />
      <Route path="/tutorials" element={<Tutorials />} />
      <Route path="/quizes" element={<Quizes />} />
      <Route path="/career-resources" element={<CareerResources />} />
      <Route path="/abouts" element={<About/>}/>   
    </Routes>
  );
};

export default RoutesComponent;
