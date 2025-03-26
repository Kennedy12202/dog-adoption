'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/supabaseClient';
import Image from 'next/image';


interface Dog {
  id: string;
  image_url: string;
  dog_breed: string;
  is_adopted: boolean;
}

interface NewDog {
  dog_breed: string;
  image_url: string;
}

export default function AdminPage() {
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dogToDelete, setDogToDelete] = useState<string | null>(null);
  const [newDog, setNewDog] = useState<NewDog>({dog_breed: '', image_url: ''});
  const [isAddingDog, setIsAddingDog] = useState(false);

  const fetchDogs = async () => {
    try {
      const { data, error } = await supabase
        .from('dogs')
        .select('*').order('dog_breed', { ascending: true });

      if (error) throw error;
      setDogs(data || []);
    } catch (err) {
      console.error('Error fetching dogs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dogs');
    } finally {
      setLoading(false);
    }
  };

  const deleteDog = async (dogId: string) => {
    try {
      console.log('Deleting dog with id: ', dogId);
      const repsonse = await supabase
        .from('dogs')
        .delete()
        .eq('id', dogId);

      console.log('Delete responses:', repsonse);
      setDogToDelete(null);
      await fetchDogs();
    } catch (err) {
      console.error('Error deleting dog:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete dog');
    }
  };

  const addDog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      //Does not matter if dog breed name is in uppercase or lowercase, it will be converted to lowercase and have spaces replaced with hyphens.
      const formattedBreed = newDog.dog_breed.toLowerCase().replace(/\s+/g, '-');
      const response = await fetch(`https://dog.ceo/api/breed/${formattedBreed}/images/random`);
      const data = await response.json();
      const image_url = data.message;
      newDog.image_url = image_url;
      const { error } = await supabase
        .from('dogs')
        .insert([{ ...newDog, is_adopted: false }]);

      if (error) throw error;
      
      setNewDog({ dog_breed: '', image_url: '' });
      setIsAddingDog(false);
      await fetchDogs();
    } catch (err) {
      console.error('Error adding dog:', err);
      setError(err instanceof Error ? err.message : 'Failed to add dog');
    }
  };

  useEffect(() => {
    fetchDogs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard - Manage Dogs</h1>
        <button
          onClick={() => setIsAddingDog(!isAddingDog)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          {isAddingDog ? 'Cancel' : 'Add New Dog'}
        </button>
      </div>

      {isAddingDog && (
        <form onSubmit={addDog} className="mb-8 p-4 border rounded-lg shadow-md">
          <div className="grid gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Dog Breed</label>
              <input
                type="text"
                value={newDog.dog_breed}
                //Break down the newDog object and set the dog_breed to the value of the input field
                onChange={(e) => setNewDog({ ...newDog, dog_breed: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              
            </div>
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Add Dog
          </button>
        </form>
      )}

{/* For every dog in the database I make a "dog card" and every dog card has an image that people can see on a website and a delete button.  */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dogs.map((dog) => (
          <div key={dog.id} className="border rounded-lg p-4 shadow-md">
            <div className="relative h-48 mb-4">
              <Image
                src={dog.image_url}
                alt={`${dog.dog_breed} dog`}
                fill
                className="rounded-lg object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <h3 className="font-semibold capitalize">{dog.dog_breed}</h3>
            <div className="flex items-center justify-between mb-4">
            </div>
            {dogToDelete === dog.id ? (
              <div className="flex gap-2">
                <button
                  onClick={() => deleteDog(dog.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setDogToDelete(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDogToDelete(dog.id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Delete Dog
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}