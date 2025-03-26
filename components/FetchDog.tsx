'use client';

import { supabase } from "@/utils/supabase/supabaseClient";
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface DogData {
  image_url: string;
  dog_breed: string;
  is_adopted: boolean;
}

interface DogApiResponse {
  message: string;
  status: 'success' | 'error';
}

interface FetchDogProps {
  showAll?: boolean;
}

const FetchDog: React.FC<FetchDogProps> = ({ showAll }) => {
  const [dogImage, setDogImage] = useState<string | null>(null);
  const [dogBreed, setDogBreed] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const uploadToSupa = async (dogData: DogData) => {
    try {
      console.log('Uploading to Supabase:', dogData);
      const { error: supabaseError } = await supabase
        .from('dogs')
        .insert([dogData]);
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(`Supabase error: ${supabaseError.message}`);
      }
      console.log('Dog uploaded to Supabase successfully');
    } catch (error) {
      console.error('Error uploading to Supabase:', error);
      throw error;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchDogImage = async () => {
      try {
        console.log('Fetching dog image...');
        const response = await fetch('https://dog.ceo/api/breeds/image/random');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as DogApiResponse;
        console.log('API response:', data);

        if (isMounted && data.status === 'success') {
          const breedMatch = data.message.match(/breeds\/([^/]+)/);
          const breed = breedMatch ? breedMatch[1].replace('-', ' ') : 'unknown';
          
          console.log('Extracted breed:', breed);
          setDogImage(data.message);
          setDogBreed(breed);

          try {
            await uploadToSupa({
              image_url: data.message,
              dog_breed: breed,
              is_adopted: false
            });
          } catch (uploadError) {
            throw new Error(`Failed to upload dog: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        } else {
          throw new Error('Invalid API response');
        }
      } catch (error) {
        console.error('Error in fetchDogImage:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDogImage();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return dogImage ? (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[500px] h-[500px]">
        <Image 
          src={dogImage}
          alt={`A random ${dogBreed} dog`}
          fill
          priority
          sizes="(max-width: 500px) 100vw, 500px"
          className="rounded-lg shadow-lg object-cover"
        />
      </div>
      {dogBreed && (
        <div className="text-lg font-semibold capitalize">Breed: {dogBreed}</div>
      )}
    </div>
  ) : null;
};

export default FetchDog;