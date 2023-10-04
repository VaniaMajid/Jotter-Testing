import { Divider, Empty, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { StyledHeader } from "Components/Header/header.style";
import Journal from "Components/Journal";
import { Journals, JournalsSection } from "Containers/ViewJournals/viewJournals.style";
import { AppDispatch, RootState } from "Redux/store";
import { useEffect } from "react";
import { fetchJournals } from "Redux/reducers/journalSlice";

export default function ViewJournals() {
  const dispatch: AppDispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchJournals());
  }, [dispatch]);

  const journals = useSelector((state: RootState) => state.journal.journals);
  console.log(journals);
  const loading = useSelector((state: RootState) => state.journal.loading);
  console.log(loading)

  return (
    <JournalsSection>
      {loading === "succeeded"? (
        <>
          <StyledHeader>Your Journals</StyledHeader>
          <Divider />
          {journals.length > 0 ? (
            <Journals>
              {journals.map((journal) => (
                <Journal key={journal._id} journalData={journal} />
              ))}
            </Journals>
          ) : (
            <Empty
              style={{ margin: "auto" }}
              imageStyle={{ height: 200 }}
              description={
                <span style={{ fontFamily: "Nunito Sans", fontWeight: "bold" }}>
                  No journals found
                </span>
              }
            />
          )}
        </>
      ) : (
        <Spin
          spinning={true}
          delay={500}
          size="large"
          style={{ margin: "auto", display: "flex", alignSelf: "center" }}
        />
      )}
    </JournalsSection>
  );
}
