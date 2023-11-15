
import heroImage from "Assets/heroImage.png";
import logo from "Assets/logo.png";
import { StyledSection } from "Templates/publicTemplate.style";

type publicTempateProps = {
  children?: any
};

const PublicTemplate: React.FC<publicTempateProps> = (props:publicTempateProps) => {

  const { children } = props;
  return (
    <StyledSection>
      <div className="imgSection">
        <img id="heroImg" src={heroImage} alt="image" />
      </div>
      <div className="form">
        <img src={logo} />
        {children}
      </div>

    </StyledSection>
  );
};

export default PublicTemplate;
