import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Popconfirm, Popover, Spin } from "antd";
import { CiMenuKebab } from "react-icons/ci";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import {
  ActionButton,
  ActionButtonCont,
  DescSection,
  JournalData,
  StyledCarousel,
  StyledDescription,
  StyledImage,
  StyledImageSection,
} from "Containers/JournalContainer/journalCont.style";
import { StyledHeader } from "Components/Header/header.style";
import { AppDispatch } from "Redux/store";
import { fetchJournals } from "Redux/reducers/journalSlice";
import axios from "axios";


interface JournalData {
  _id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  timestamp: any;
}

function JournalCont () {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const { journalId } = useParams<{ journalId: string }>();
  console.log(journalId);
  const [journalData, setJournalData] = useState< JournalData | null>(null); 
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect( () => {


    dispatch(fetchJournals())
    .then((action) => {

      const fetchedJournals = action.payload;

      // Find the specific journal by ID
      const foundJournal = fetchedJournals.find((journal: JournalData) => journal._id === journalId);
      console.log(foundJournal);
      setJournalData(foundJournal);
      const serverUrl = 'http://localhost:5000'; 
      const urls = foundJournal.images.map((filename: any) => `${serverUrl}/uploads/${filename}`);
      setImageUrls(urls);
    })
    .catch((error) => {
      console.error('Error fetching journals:', error);
    });
  }, [dispatch]);

  const editJournal = async () => {
    navigate(`/editjournal/${journalId}`);
  };

  const deleteJournal = async () => {
    try {
      // Send a request to delete the journal entry
      const response = await axios.delete(`http://localhost:5000/delete-journal/${journalId}`);
  
      if (response.status === 200) {
        // Journal deleted successfully, navigate to the desired route
        navigate("/");
      } else {
        console.error('Error deleting journal:', response.data.message);
        // Handle the error as needed
      }
    } catch (error) {
      console.error('Error deleting journal:', error);
      // Handle the error as needed
    }
  };
  
  const content = (
    <ActionButtonCont>
      <ActionButton onClick={editJournal} icon={<EditOutlined />}>
        Edit
      </ActionButton>
      <Popconfirm
        title="Delete Journal"
        description="Are you sure you want to delete this Journal?"
        onConfirm={deleteJournal}
        okText="Yes"
        cancelText="No"
      >
        <ActionButton icon={<DeleteOutlined />}>Delete</ActionButton>
      </Popconfirm>
    </ActionButtonCont>
  );

  return (
    <JournalData>
      {journalData? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <StyledHeader>{journalData.title}</StyledHeader>
            <Popover
              placement="leftTop"
              title="Actions"
              content={content}
              trigger="click"
            >
              <CiMenuKebab style={{ fontSize: "23px" }} />
            </Popover>
          </div>

          <DescSection>
            <StyledDescription>{journalData.description}</StyledDescription>
            {imageUrls.length > 0 ? (
              <StyledCarousel autoplay>
                {imageUrls.map((imageUrl, index) => (
                  <StyledImageSection key={index}>
                    <StyledImage
                      width="100%"
                      height="21vh"
                      src={imageUrl}
                      alt={`Image ${index}`}
                    />
                  </StyledImageSection>
                ))}
              </StyledCarousel>
            ) : (
              <></>
            )}
          </DescSection>
        </>
      ) : (
        <Spin
          spinning={true}
          delay={500}
          size="large"
          style={{ margin: "auto", display: "flex", alignSelf: "center" }}
        />
      )}
    </JournalData>
  );
}

export default JournalCont;
