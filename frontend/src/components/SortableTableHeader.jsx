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
  align = "left",
  className = "",
  menuItems = null,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const hasCustomMenu = Array.isArray(menuItems) && menuItems.length > 0;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSort = (direction) => {
    if (onSort) {
      onSort(sortKey, direction);
    }
    handleMenuClose();
  };

  const handleClearSort = () => {
    if (onClearSort) {
      onClearSort(sortKey);
    }
    handleMenuClose();
  };

  const handleLabelClick = () => {
    if (onSort) {
      onSort(sortKey);
    }
  };

  const handleCustomMenuClick = (action) => {
    if (typeof action === "function") {
      action();
    }
    handleMenuClose();
  };

  const isActive = currentSort.key === sortKey;

  return (
    <TableCell
      className={className}
      component="th"
      scope="col"
      align={align}
      sx={{
        backgroundColor: "#7B1113",
        color: "white",
        fontWeight: "bold",
        position: "relative",
        verticalAlign: "middle",
        padding: "0.75rem 1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span
          style={{ color: "white", cursor: onSort ? "pointer" : "default" }}
          onClick={handleLabelClick}
        >
          {label}
        </span>
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
          {hasCustomMenu ? (
            <div>
              {menuItems.map(({ label: itemLabel, onClick, disabled }, idx) => (
                <MenuItem
                  key={`${itemLabel}-${idx}`}
                  disabled={disabled}
                  onClick={() => handleCustomMenuClick(onClick)}
                >
                  {itemLabel}
                </MenuItem>
              ))}
              {isActive && onClearSort && (
                <MenuItem onClick={handleClearSort}>
                  <Clear fontSize="small" sx={{ mr: 1 }} /> Undo Sort
                </MenuItem>
              )}
            </div>
          ) : (
            <div>
              <MenuItem onClick={() => handleSort("asc")}>
                <ArrowUpward fontSize="small" sx={{ mr: 1 }} /> Sort Ascending
              </MenuItem>
              <MenuItem onClick={() => handleSort("desc")}>
                <ArrowDownward fontSize="small" sx={{ mr: 1 }} /> Sort
                Descending
              </MenuItem>
              {isActive && (
                <MenuItem onClick={handleClearSort}>
                  <Clear fontSize="small" sx={{ mr: 1 }} /> Undo Sort
                </MenuItem>
              )}
            </div>
          )}
        </Menu>
      </div>
    </TableCell>
  );
};

export default SortableTableHeader;