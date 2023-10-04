import { Carousel } from "antd";
import Meta from "antd/es/card/Meta";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Description, JournalCard, StyledCarouselImg } from "Components/Journal/journal.style";
import journal from "Assets/journalImgPlaceholder.jpg";

interface JournalData {
  _id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  timestamp: any;
}

function Journal({ journalData }: { journalData: JournalData }) {

  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const serverUrl = 'http://localhost:5000'; 
    const urls = journalData.images.map((filename) => `${serverUrl}/uploads/${filename}`);
    setImageUrls(urls);
  }, [journalData.images]);

  console.log(journalData);
  console.log(journalData._id);

  return (
    <Link to={`${journalData._id}`}>
      
      <JournalCard
        hoverable
        bordered={false}
        cover={imageUrls.length > 0 ? (
          <Carousel autoplay style={{ height: "max-content", width: "100%" }}>
            {imageUrls.map((imageUrl, index) => (
              <div key={index}>
                <StyledCarouselImg src={imageUrl} />
              </div>
            ))}
          </Carousel>
        ) : (
          <StyledCarouselImg src={journal} />
        )}
      >
        <Meta
          title={journalData.title}
          description={<Description>{journalData.description}</Description>}
        />
      </JournalCard>
    </Link>
  );
}

export default Journal;
