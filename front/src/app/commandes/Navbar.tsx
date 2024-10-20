"use client"; // Required for Next.js 13+ client components
import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Link from "next/link";

// Navbar component
const Navbar: React.FC = () => {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: "#1976d2", // Primary color for AppBar
        paddingX: 2, // Horizontal padding for better alignment
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between", // Space between title and buttons
          alignItems: "center",
        }}
      >
        {/* Title of the Navbar */}
        <Button
          component={Link}
          href="/Reception"
          color="inherit"
          sx={{
            fontWeight: "bold",
            textTransform: "none",
            fontSize: "16px",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
          }}
        >
          Bon De livraison
        </Button>

        {/* Navigation Links - wrapped in Button for better click area */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2, // Space between buttons
          }}
        >
          <Button
            component={Link}
            href="/client"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            الفلاح
          </Button>

          <Button
            component={Link}
            href="/commandes"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            الفلاح الطلبات
          </Button>

          <Button
            component={Link}
            href="/createCommande"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            الفلاح إنشاء طلب
          </Button>

          <Button
            component={Link}
            href="/coffreGestion"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            إدارة الصندوق
          </Button>

          <Button
            component={Link}
            href="/testP"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            Camion Taher          </Button>
          <Button
            component={Link}
            href="/createCommandePersonelle"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            إنشاء طلب خراص
          </Button>

          <Button
            component={Link}
            href="/type-de-datte"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            تمر
          </Button>

          {/* New Button for Camion Fournisseur */}
          <Button
            component={Link}
            href="/Testf"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            شاحنة المورد / Camion Fournisseur
          </Button>

          {/* New Button for الخراص liste */}
          <Button
            component={Link}
            href="/PersonnelList"
            color="inherit"
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              fontSize: "16px",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              },
            }}
          >
            الخراص liste
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default React.memo(Navbar); // To optimize performance with React.memo
