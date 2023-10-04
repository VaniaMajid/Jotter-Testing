import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import jwtDecode from "jwt-decode"; // Import the jwt-decode library


const API_URL = "http://localhost:5000/journals"; 
const decodedToken: any = jwtDecode(localStorage.getItem("token") || "");

interface JournalData {
  _id: string;
  userId: string;
  title: string;
  description: string;
  images: string[];
  timestamp: any;
}

interface JournalState {
  journals: JournalData[];
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

const initialState: JournalState = {
  journals: [],
  loading: "idle",
  error: null,
};

export const fetchJournals = createAsyncThunk("journal/fetchJournals", async () => {
  try {
    const userId = decodedToken.userId; // Extract user ID from the decoded token

    // Make the API request using the fetch API
    const response = await fetch(`${API_URL}/${userId}`);

    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    throw error;
  }
});

export const journalSlice = createSlice({
  name: "journal",
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJournals.pending, (state) => {
        state.loading = "pending";
        state.error = null;
      })
      .addCase(fetchJournals.fulfilled, (state, action) => {
        state.loading = "succeeded";
        state.journals = action.payload;
      })
      .addCase(fetchJournals.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.error.message || "An error occurred while fetching journals.";
      });
  },
});

export default journalSlice.reducer;
