import React, { useState } from "react";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import Clear from "@mui/icons-material/Clear";

const SortableTableHeader = ({
  label,
  sortKey,
  currentSort,
  onSort,
  onClearSort,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (direction) => {
    onSort(sortKey, direction);
    handleMenuClose();
  };

  const handleClearSort = () => {
    onClearSort(sortKey);
    handleMenuClose();
  };

  const isActive = currentSort.key === sortKey;

  return (
    <TableCell
      sx={{
        backgroundColor: "#7B1113",
        color: "white",
        fontWeight: "bold",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "white" }}>{label}</span>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          disableRipple
          disableFocusRipple
          sx={{
            color: "white",
            padding: 0,
            borderRadius: 0,
            backgroundColor: "transparent !important",
            "&:hover": { backgroundColor: "transparent", opacity: 0.8 },
            "&:focus": { backgroundColor: "transparent" },
            "&:active": { backgroundColor: "transparent" },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={() => handleSort("asc")}>
            <ArrowUpward fontSize="small" sx={{ mr: 1 }} /> Sort Ascending
          </MenuItem>
          <MenuItem onClick={() => handleSort("desc")}>
            <ArrowDownward fontSize="small" sx={{ mr: 1 }} /> Sort Descending
          </MenuItem>
          {isActive && (
            <MenuItem onClick={handleClearSort}>
              <Clear fontSize="small" sx={{ mr: 1 }} /> Undo Sort
            </MenuItem>
          )}
        </Menu>
      </div>
    </TableCell>
  );
};

export default SortableTableHeader;
