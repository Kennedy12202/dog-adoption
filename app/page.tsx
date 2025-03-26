'use client';

import FetchDog from "@/components/FetchDog";


export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">Adopt Dog</h1>
        <FetchDog />
    </div>
  );
}