import { Divider, Image, Spin } from "antd";
import { ChangeEvent, useEffect, useState } from "react";
import { ImCross } from "react-icons/im";
import { CameraOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
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
import { fetchJournals } from "Redux/reducers/journalSlice";
import { AppDispatch } from "Redux/store";
import { useDispatch } from "react-redux";

interface JournalData {
    _id: string;
    userId: string;
    title: string;
    description: string;
    images: string[];
    timestamp: any;
}

export default function EditJournal() {
    const navigate = useNavigate();
    const dispatch: AppDispatch = useDispatch();
    const decodedToken: any = jwtDecode(localStorage.getItem("token") || "");
    const { journalId } = useParams<{ journalId: string }>();
    const [journalData, setJournalData] = useState<JournalData | null>(null)!;
    const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    console.log("selectedFiles", files);
    const [formValues, setFormValues] = useState({
        title: journalData?.title || "",
        description: journalData?.description || "",
    });
    console.log("form", formValues);
    const [errMsg, setErrMsg] = useState("");
    const [showAddButton, setShowAddButton] = useState(true);
    const [loading, setLoading] = useState(true);
    console.log("loading", loading);

    useEffect(() => {
        setLoading(true);

        dispatch(fetchJournals())
            .then((action) => {
                const fetchedJournals = action.payload;
                const foundJournal = fetchedJournals.find(
                    (journal: JournalData) => journal._id === journalId
                );
                setJournalData(foundJournal);
                const serverUrl = "http://localhost:5000";
                const urls = foundJournal.images.map(
                    (filename: any) => `${serverUrl}/uploads/${filename}`
                );
                setSelectedFiles(urls);
            })
            .catch((error) => {
                console.error("Error fetching journals:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [dispatch, journalId]);

    useEffect(() => {
        if (journalData) {
            setFormValues({
                title: journalData.title,
                description: journalData.description,
            });
        }
    }, [journalData]);

    const handleDeleteImage = (index: number) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(updatedFiles);
        setShowAddButton(true);
    };

    const handleFieldChange = (fieldName: string, value: string) => {
        setFormValues((prevValues) => ({
            ...prevValues,
            [fieldName]: value,
        }));
    };

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(event.target.files || []);

        if (newFiles.length + selectedFiles.length <= 3) {
            setErrMsg("");
            const objectUrls = await Promise.all(
                newFiles.map(async (file) => {
                    const blob = file instanceof Blob ? file : new Blob([file]);
                    return URL.createObjectURL(blob);
                })
            );

            setFiles((prevFiles) => [...prevFiles, ...newFiles]);
            setSelectedFiles((prevFiles) => [...prevFiles, ...objectUrls]);
        } else {
            setErrMsg("Select 3 images at max!");
        }

        if (newFiles.length + selectedFiles.length === 3) {
            setShowAddButton(false);
        }
    };


    const handleSave = async () => {
        if (!formValues.title || !formValues.description) {
            setErrMsg("Please fill in all fields and upload images!");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('userId', decodedToken.userId);
            formData.append('title', formValues.title);
            formData.append('description', formValues.description);
            // If there are new selectedFiles, append them
            console.log("new files: ", files)
            console.log("selected files: ", selectedFiles);

        
            for (let i = 0; i < selectedFiles.length; i++) {
                const imageUrl = selectedFiles[i];
                const filename = selectedFiles[i].replace("http://localhost:5000/uploads/", '');
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                formData.append('images', blob, filename); 
            
            }

            // Log the contents of formData
            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }


            formData.append('timestamp', Date());

            const response = await axios.put(`http://localhost:5000/update-journal/${journalId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                navigate("/");
            } else if (response.status === 400) {
                console.error('Error updating journal!:', response.data.message);
                setErrMsg(response.data.message); // Displaying server-side error message
            } else {
                console.error('Unexpected error updating journal. Status:', response.statusText);
                setErrMsg('Unexpected error. Please try again.'); // Displaying a generic error message
            }
        } catch (error) {
            console.error('Error updating journal:', error);
            setErrMsg('An error occurred. Please try again.'); // Displaying a generic error message
        }
    };



    return (
        <AddJournalSection>
            {loading ? (
                <Spin
                    spinning={true}
                    delay={500}
                    size="large"
                    style={{ margin: "auto", display: "flex", alignSelf: "center" }}
                />

            ) : (
                <>
                    <StyledHeader>Write down your thoughts</StyledHeader>
                    <Divider />
                    <JournalInput
                        name="title"
                        placeholder="Enter your journal title"
                        value={formValues.title}
                        onChange={(event) => handleFieldChange("title", event.target.value)}
                    />

                    <DescSection>
                        <JournalInput
                            name="description"
                            placeholder="Write your thoughts..."
                            value={formValues.description}
                            onChange={(event) => handleFieldChange("description", event.target.value)}
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
                                name="images"
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
                                            src={file}
                                        />
                                        <DelBtn onClick={() => handleDeleteImage(index)}>
                                            <ImCross style={{ color: "red", fontSize: "80px" }} />
                                        </DelBtn>
                                    </ImgCont>
                                ))}
                            </ImgPreview>
                        </ImgUploadSection>
                        <ButtonComponent
                            name="Edit Journal"
                            click={handleSave}
                            width="300px"
                            margin="0px"
                        />
                    </div>
                </>

            )}

        </AddJournalSection>
    );
}
