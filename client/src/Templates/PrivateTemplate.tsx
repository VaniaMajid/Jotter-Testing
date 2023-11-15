import { Layout } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Sidebar from "Containers/Sidebar";
import Navbar from "Containers/Navbar";
import { AppDispatch } from "Redux/store";
import { fetchJournals } from "Redux/reducers/journalSlice";
import jwtDecode from "jwt-decode";

type privateTemplateProps = {
  children?: any
};

const PrivateTemplate: React.FC<privateTemplateProps> = (props: privateTemplateProps) => {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {

    const token = localStorage.getItem('token'); 
    console.log(token)
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        console.log("token: ", decodedToken)
        // Check if the token is not expired
        const currentTime = Date.now() / 1000; 
        console.log(decodedToken.exp);
        console.log(currentTime);
        if (decodedToken.exp > currentTime) {
          dispatch(fetchJournals());
          console.log(token);
        }
      } catch (error) {
        console.error('Invalid token:', error);
        navigate("/login");
      }
    }
    else {
      navigate("/login");
    }

  }, []);

  const { children } = props;
  return (
    <Layout style={{ margin: "-8px", backgroundColor: "#ffffff" }}>
      <Navbar />
      <Layout style={{ maxHeight: "100vh", backgroundColor: "#ffffff" }}>
        <Sidebar />
        <Layout style={{ backgroundColor: "#ffffff", padding: "20px" }}>
          {children}
        </Layout>
      </Layout>
    </Layout>
  );
};

export default PrivateTemplate;
