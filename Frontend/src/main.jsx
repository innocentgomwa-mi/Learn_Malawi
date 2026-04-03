// main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { NewsProvider } from './contexts/NewsContext'
import { StudyNotesProvider } from './contexts/StudyNotesContext';
import { PastPapersProvider } from './contexts/PastPapersContext';
import { CareerResourcesProvider } from './contexts/CareerResourcesContext';
import { TutorialsProvider } from './contexts/TutorialsContext';
import { QuizzesProvider } from './contexts/QuizzesContext';
import { ContactProvider } from './contexts/ContactContext';
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { MessagesProvider } from './contexts/MessagesContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
       <MessagesProvider>
        <UserProvider>
          <StudyNotesProvider>
            <ContactProvider>
              <PastPapersProvider>
                <CareerResourcesProvider>
                  <TutorialsProvider>
                    <QuizzesProvider>
                      <NewsProvider>
                        <App />
                      </NewsProvider>
                    </QuizzesProvider>
                  </TutorialsProvider>
                </CareerResourcesProvider>
              </PastPapersProvider>
            </ContactProvider>
          </StudyNotesProvider>
        </UserProvider>
        </MessagesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)