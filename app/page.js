"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import {
  Box,
  Button,
  Grid,
  Modal,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  collection,
  getDocs,
  query,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, "inventory"));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="white"
          border="2px solid #0000"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{
            transform: "translate(-50%, -50%)",
          }}
        >
          <Typography variant="h6">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
              }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName("");
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button
        variant="contained"
        onClick={() => {
          handleOpen();
        }}
      >
        Add NewItem
      </Button>
      <Box border={"1px solid #333"}>
        <Box
          width="800px"
          height="100px"
          bgcolor={"#ADD8E6"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant="h2" color="#333" textAlign={"center"}>
            Inventory Items
          </Typography>
        </Box>

        <Stack
          width={"100%"}
          height={"350px"}
          spacing={2}
          overflow={"auto"}
          sx={{
            "&::-webkit-scrollbar": {
              width: "12px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f0f0f0",
              borderRadius: "10px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "10px",
              border: "3px solid #f0f0f0",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#555",
            },
          }}
        >
          {inventory.map(({ name, quantity }) => (
            <Grid // Use Grid container for better alignment
              container
              key={name}
              width={"100%"}
              minHeight={"150px"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"space-between"}
              // bgcolor={"#f0f0f0"}
              paddingX={5}
            >
              <Grid item xs={4}>
                <Typography
                  variant="h3"
                  color={"#333"}
                  justifyContent={"flex-start"}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h3" color={"#333"} textAlign={"center"}>
                  {quantity}
                </Typography>
              </Grid>
              <Grid item xs={4}>
                <Stack
                  direction={"row"}
                  spacing={2}
                  justifyContent={"flex-end"}
                >
                  <Button
                    variant="contained"
                    onClick={() => {
                      addItem(name);
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      removeItem(name);
                    }}
                  >
                    Remove
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
