import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

type Picture = {
  id: number;
  url: string;
  title: string;
  user_id: number;
  created_at: string;
  username: string;
};

const WithoutHome = () => {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);

  const fetchPictures = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/pictures/all`);
      const { data } = response;

      if (Array.isArray(data.pictures)) {
        setPictures((prevPictures) => {
          const newPictures = data.pictures.filter(
            (newPic: Picture) => !prevPictures.some((pic) => pic.id === newPic.id)
          );
          return [...prevPictures, ...newPictures];
        });
      } else {
        setError("Unexpected response format. Please try again later.");
      }
    } catch (err) {
      console.error("Error fetching pictures:", err);
      setError("Failed to load pictures. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = () => {
    const bottom = window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 100;
    if (bottom && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    fetchPictures();
  }, [page]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loading]);

  return (
    <div>
      <header className="flex justify-between items-center bg-white shadow-md py-4 w-full">
        <div className="text-center font-serif text-[30px] font-semibold leading-[35.13px] ml-2 decoration-black">PicShare</div>
        <div>
          <Link to="/login">
            <button className="py-1 px-2 bg-[#1890FF] text-white rounded-sm mr-6">
              Log In
            </button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <main>
          {!localStorage.getItem("userId") && (
            <p className="bg-gray-100 py-2 text-center my-4 mt-4 text-lg rounded-md">
              <Link to="/login" className="text-[#1890FF] font-semibold">
                login
              </Link>
              {" "}to start sharing your favorite pictures with others!
            </p>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
          <div className="grid grid-cols-1 mt-6 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {pictures.length === 0 ? (
              <p className="col-span-full text-center">No pictures to display.</p>
            ) : (
              pictures.map((picture: Picture) => (
                <div key={picture.id} className="bg-white p-4 rounded-md shadow-md">
                  <img
                    src={picture.url}
                    alt={picture.title}
                    className="w-full h-[260px] object-cover rounded-sm"
                  />
                  <div className="mt-2 text-center">
                    <h3 className="font-semibold">{picture.title}</h3>
                    <p className="text-gray-500 mt-2">{picture.username}</p>
                    <p className="text-gray-500">{new Date(picture.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {loading && (
            <div className="text-center my-4">
              <p>Loading more pictures...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WithoutHome;
