// src/components/ReferralTable.jsx
import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const ReferralTable = ({ rows }) => {
  const columns = [
    { field: "student_name", headerName: "Student Name", flex: 1 },
    { field: "student_number", headerName: "Student Number", flex: 1 },
    { field: "date_referred", headerName: "Date Referred", flex: 1 },
    { field: "referred_by", headerName: "Referred By", flex: 1 },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Referral Forms
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
          sx={{
            "& .MuiDataGrid-columnHeaders": { backgroundColor: "#f5f5f5" },
          }}
        />
      </Box>
    </Box>
  );
};

export default ReferralTable;
