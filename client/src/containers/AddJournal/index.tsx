import { Divider, Image } from "antd";
import { ChangeEvent, useState } from "react";
import { ImCross } from "react-icons/im";
import { CameraOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ButtonComponent from "Components/BtnComponent";
import JournalInput from "Components/JournalInput";
import {
  AddJournalSection,
  DelBtn,
  DescSection,
  ImgCont,
  ImgPreview,
  ImgUpload,
  ImgUploadSection,
} from "Containers/AddJournal/addJournal.style";
import { StyledHeader } from "Components/Header/header.style";
import jwtDecode from "jwt-decode";
import axios from "axios";

export default function AddNewJournal() {
  const navigate = useNavigate();
  const decodedToken: any = jwtDecode(localStorage.getItem("token") || "");


  const initialFormState = {
    title: "",
    description: "",
  };

  const [formValues, setFormValues] = useState(initialFormState);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [errMsg, setErrMsg] = useState("");
  const [showAddButton, setShowAddButton] = useState(true);


  const handleFieldChange = (fieldName: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    console.log(files);
    if (files.length + selectedFiles.length <= 3) {
      setErrMsg("");
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    } else {
      setErrMsg("Select 3 images at max!");
    }

    if (files.length + selectedFiles.length == 3) {
      setShowAddButton(false);
    }
  };



  const handleDeleteImage = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setShowAddButton(true);
  };

  const handleSave = async () => {
    if (!formValues.title || !formValues.description) {
      setErrMsg("Please fill in all fields and upload images!");
      return;
    }

    try {
      // const journalData = {
      //   userId: decodedToken.userId,
      //   title: formValues.title,
      //   description: formValues.description,
      //   images: selectedFiles,
      //   timestamp: new Date(),
      // };
      // console.log(journalData)

      const formData = new FormData();
      formData.append('userId', decodedToken.userId);
      formData.append('title', formValues.title);
      formData.append('description', formValues.description);
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }
      formData.append('timestamp', Date());

      const response = await axios.post('http://localhost:5000/create-journal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.status === 201) {
        navigate("/");
      } else if (response.status === 400) {
        console.error('Error creating journal!:', response.data.message);
      } else {
        console.error('Unexpected error creating journal. Status:', response.statusText);
      }
    } catch (error) {
      console.log(selectedFiles)

      console.error('Error creating journal:', error);
    }
  };


  return (
    <AddJournalSection>
      <StyledHeader>Write down your thoughts</StyledHeader>
      <Divider />
      <JournalInput
        name="title"
        placeholder="Enter your journal title"
        onChange={(event) => handleFieldChange("title", event.target.value)}
      />
      <DescSection>
        <JournalInput
          name="description"
          placeholder="Write your thoughts..."
          onChange={(event) =>
            handleFieldChange("description", event.target.value)
          }
        />
      </DescSection>
      <p>{errMsg}</p>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        <ImgUploadSection>
          <ImgUpload
            htmlFor="imageUpload"
            style={{ display: showAddButton ? "flex" : "none" }}
          >
            <CameraOutlined />
          </ImgUpload>
          <input
            type="file"
            accept="image/*"
            id="imageUpload"
            onChange={handleImageUpload}
            style={{ display: "none" }}
            multiple
          />

          <ImgPreview style={{ display: "flex", flexWrap: "wrap" }}>
            {selectedFiles.map((file, index) => (
              <ImgCont key={index}>
                <Image
                  alt={`Uploaded Preview ${index}`}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                  src={URL.createObjectURL(file)}
                />
                <DelBtn onClick={() => handleDeleteImage(index)}>
                  <ImCross style={{ color: "red", fontSize: "80px" }} />
                </DelBtn>
              </ImgCont>
            ))}
          </ImgPreview>
        </ImgUploadSection>
        <ButtonComponent
          name="Add Journal"
          click={handleSave}
          width="300px"
          margin="0px"
        />
      </div>

    </AddJournalSection>
  );
}
