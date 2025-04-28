import React from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
} from "@mui/material";

const CustomTable = ({ columns, rows, noDataMessage }) => {
  return (
    <Paper sx={{ backgroundColor: "#161a2d", padding: 2 }}>
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#161a2d", maxHeight: "calc(80vh - 110px)" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1f233a" }}>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{
                    backgroundColor: "#1f233a",
                    color: "#F1E7E7",
                    fontWeight: "bold",
                  }}
                >
                  {col.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <TableRow key={row.id || rowIndex} sx={{ color: "#F1E7E7" }}>
                  {columns.map((col) => (
                    <TableCell key={col.field} sx={{ color: "#F1E7E7" }}>
                      {col.renderCell
                        ? col.renderCell(row, rowIndex)
                        : row[col.field] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ textAlign: "center", color: "#F1E7E7" }}
                >
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

CustomTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      headerName: PropTypes.string.isRequired,
      renderCell: PropTypes.func,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  noDataMessage: PropTypes.string,
};

export default CustomTable;
