"use client"
import FetchPgDetails from "./components/fetchPgDetails.jsx";
import HomePage from "./components/header";
import { Suspense } from 'react';



export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FetchPgDetails />
    </Suspense>
  );
}
