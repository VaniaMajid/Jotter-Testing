import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicTemplate from "Templates/PublicTemplate";
import LoginForm from "Containers/Login";
import SignUpForm from "Containers/Signup";
import ViewJournals from "Containers/ViewJournals";
import AddNewJournal from "Containers/AddJournal";
import JournalCont from "Containers/JournalContainer";
import PrivateTemplate from "Templates/PrivateTemplate";
import EditJournal from "Containers/EditJournal";

function App() {
  console.log('reached in app.tsx')
  

  const privateRoutes = [
    {
      key: 1,
      path: "/",
      element: <ViewJournals />,
    },
    {
      key: 2,
      path: "/settings",
      element: <div>Settings</div>,
    },
    {
      key: 3,
      path: "/guide",
      element: <div>Guide</div>,
    },
    {
      key: 4,
      path: "/createjournal",
      element: <AddNewJournal />,
    },
    {
      key: 5,
      path: "/:journalId",
      element: <JournalCont />,
    },
    {
      key: 4,
      path: "/editjournal/:journalId",
      element: <EditJournal />,
    },
  ];

  const publicRoutes = [
    {
      key: 6,
      path: "/login",
      element: <LoginForm />,
    },
    {
      key: 7,
      path: "/signup",
      element: <SignUpForm />,
    },
  ];

  const generatePublicRoutes = () => publicRoutes.map((item) => (
    <Route
      key={item?.key}
      path={item?.path}
      element={
        <PublicTemplate children={item.element} />
        }
    />
  ));

  const generatePrivateRoutes = () => privateRoutes.map((item) => (
    <Route
      path={item?.path}
      element={
        <PrivateTemplate children={item.element} />
        }
    />
  ));

  return (
    <BrowserRouter>
      <Routes>
        {generatePublicRoutes()}
        {generatePrivateRoutes()}
      </Routes>

    </BrowserRouter>
  );
}

export default App;
