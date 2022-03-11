import React from 'react';
import ReactDOM from 'react-dom';
import reportWebVitals from './reportWebVitals';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import { initializeApp } from 'firebase/app';

import './index.css';

import HomePage from './pages/home';
import NotFoundPage from './pages/notFound';
import BoardPage from './pages/board';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

/*

TODO:
  - board buttons cancel item edit
  - when adding new list, don't clear input during onValue update
  - add edited item on + click/touch
  - help page
    - versioning

*/

const firebaseConfig = {
  apiKey: "AIzaSyBnyTbJHZLs2fNSkRWtFthZAV1faV_3Nas",
  authDomain: "wichtige-notizen.firebaseapp.com",
  databaseURL: "https://wichtige-notizen-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "wichtige-notizen",
  storageBucket: "wichtige-notizen.appspot.com",
  messagingSenderId: "517135488735",
  appId: "1:517135488735:web:a6184e6e33072dfa3afb6a"
};

initializeApp(firebaseConfig);

if (localStorage.getItem('localBoards') === null) {
  localStorage.setItem('localBoards', '[]');
}
if (localStorage.getItem('sharedBoards') === null) {
  localStorage.setItem('sharedBoards', '[]');
}

function AnimationRoute() {
  const location = useLocation();

  return (
    <TransitionGroup>
      <CSSTransition
        key={location.pathname}
        classNames='slide'
        timeout={500}>
        <Routes location={location}>
          <Route path='/' element={<HomePage />} />
          <Route path='/board' element={<BoardPage />} />
          <Route path='*' element={<NotFoundPage />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path='*' element={<AnimationRoute />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
