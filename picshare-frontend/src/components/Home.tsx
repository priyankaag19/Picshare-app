import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { error } from "console";

const urlRegex = /^(https?:\/\/)([a-z0-9\-]+\.)+[a-z0-9]{2,4}\/.+/i;

const Home = () => {
  const [pictures, setPictures] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"image" | "share" | null>(null);
  const [pictureUrl, setPictureUrl] = useState<string>("");
  const [pictureTitle, setPictureTitle] = useState<string>("");
  const [selectedPicture, setSelectedPicture] = useState<any>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set<number>());
  const [urlError, setUrlError] = useState<string>("");
  const [titleError, setTitleError] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Guest";

  const picturesPerPage = 12;

  useEffect(() => {
    const fetchPictures = async () => {
      if (!userId) return;
      setLoading(true);
      setErrorMessage("");
      try {
        const { data } = await axios.get("http://localhost:5000/api/pictures", {
          params: { userId },
        });

        const sortedData = data.pictures.sort((a: { created_at: string }, b: { created_at: string }) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setPictures(sortedData);
      } catch (error) {
        console.error("Error fetching pictures:", error);
        setErrorMessage("Failed to load pictures. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      if (!userId) return;

      try {
        const { data } = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
        const favoriteSet = new Set<number>(data.map((fav: any) => fav.id));
        setFavorites(favoriteSet);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchPictures();
    fetchFavorites();
  }, [userId]);

  const handleLogOut = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const handleFavoriteToggle = async (pictureId: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(pictureId)) {
      await axios.delete("http://localhost:5000/api/favorites", {
        data: { userId, pictureId },
      });
      newFavorites.delete(pictureId);
    } else {
      await axios.post("http://localhost:5000/api/favorites", { userId, pictureId });
      newFavorites.add(pictureId);
    }
    setFavorites(newFavorites);
  };

  const handlePictureClick = (picture: any) => {
    setSelectedPicture(picture);
    setModalType("image");
    setIsModalOpen(true);
  };

  const handleSharePic = async () => {
    let valid = true;

    // Validate the URL
    if (!pictureUrl || !urlRegex.test(pictureUrl)) {
      setUrlError("Please provide a valid URL.");
      valid = false;
    } else {
      setUrlError("");
    }

    // Validate the Title
    if (!pictureTitle) {
      setTitleError("Please provide a title.");
      valid = false;
    } else {
      setTitleError("");
    }
    if (!valid) return;
    try {
      const response = await axios.post("http://localhost:5000/api/pictures", {
        url: pictureUrl,
        title: pictureTitle,
        userId,
      });
      setPictures((prevPictures) => [
        {
          url: pictureUrl,
          title: pictureTitle,
          id: response.data.pictureId,
          username: userName,
          created_at: new Date().toISOString()
        },
        ...prevPictures,
      ]);
      setIsModalOpen(false);
      setPictureUrl("");
      setPictureTitle("");
    } catch (error) {
      console.error("Error sharing picture:", error);
    }
  };

  const handleShareButtonClick = () => {
    setModalType("share");
    setIsModalOpen(true);
    setUrlError("");
    setTitleError("");
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-[#1890FF] border-b-2 border-blue-500 pb-1"
      : "text-gray-800";

  const formatDate = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "Unknown Date" : date.toLocaleDateString();
  };

  // Pagination helpers
  const lastIndex = currentPage * picturesPerPage;
  const firstIndex = lastIndex - picturesPerPage;
  const currentPictures = pictures.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(pictures.length / picturesPerPage);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div>
      <header className="flex justify-between items-center bg-white shadow-md py-4 w-full">
        <div className="flex items-center">
          <h1 className="text-center font-serif text-[30px] font-semibold leading-[35.13px] decoration-black mr-8 ml-4">PicShare</h1>
          <button onClick={() => navigate("/home")} className={`mr-4 ${isActive("/home")}`}>
            Home
          </button>
          <button onClick={() => navigate("/favorites")} className={`mr-4 ${isActive("/favorites")}`}>
            Favorites
          </button>
        </div>
        <div className="flex items-center">
          <button onClick={handleShareButtonClick} className="ml-6 py-1 px-4 bg-[#1890FF] text-white rounded-sm">
            Share Pic
          </button>
          <p className="mr-6 ml-6">Hi {userName}</p>
          <p onClick={handleLogOut} className="text-[#1890FF] cursor-pointer inline mr-4">
            Log out
          </p>
        </div>
      </header>

      <div className="container mx-auto my-auto h-auto px-4">
        <div className="mb-4 mt-8">
          {loading ? (
            <p>Loading Pics...</p>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {currentPictures.map((picture: any) => (
                <div key={picture.id} className="relative border p-4 rounded-md">
                  <img
                    src={picture.url}
                    onClick={() => handlePictureClick(picture)}
                    alt={picture.title}
                    className="w-full h-[260px] flex items-center justify-between rounded-sm cursor-pointer"
                  />
                  <p className="mt-2 text-center text-lg font-semibold">{picture.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">{userName || "Unknown"}</p>
                    <button
                      onClick={() => handleFavoriteToggle(picture.id)}
                      className={`text-2xl ${favorites.has(picture.id) ? "text-red-500" : "text-gray-200"}`}
                    >
                      <FaHeart />
                    </button>
                  </div>
                  <p className="text-sm mt-1 text-gray-600">{formatDate(picture.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {/* Pagination controls */}
        {!loading && !errorMessage && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 mx-1 ${currentPage === index + 1 ? "bg-[#1890FF] text-white" : "bg-gray-200"} rounded`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 mx-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

      </div>

      {/* Modal for sharing picture */}
      {isModalOpen && modalType === "share" && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-sm relative min-w-[572px] min-h-[200px]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-2xl text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-6">Share Your Picture</h2>
            <hr />
            <div>
              <input
                type="text"
                value={pictureUrl}
                onChange={(e) => setPictureUrl(e.target.value)}
                className="w-full p-2 mb-2 mt-4 border rounded-md"
                placeholder="Enter image URL"
              />
              {urlError && <p className="text-red-500 text-sm">{urlError}</p>}
            </div>
            <div>
              <input
                type="text"
                value={pictureTitle}
                onChange={(e) => setPictureTitle(e.target.value)}
                className="w-full p-2 mb-2 border rounded-md"
                placeholder="Enter title"
              />
              {titleError && <p className="text-red-500 text-sm">{titleError}</p>}
            </div>
            <hr className="mt-4" />
            <div className="flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="py-2 px-4 bg-gray-200 text-white mt-4 rounded-sm">
                Cancel
              </button>
              <button onClick={handleSharePic} className="py-2 px-4 bg-[#1890FF] text-white rounded-sm mt-4 ml-4">
                Share
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for showing picture */}
      {isModalOpen && modalType === "image" && selectedPicture && (
        <div className="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-black p-8 rounded-sm relative max-w-3xl max-h-[80vh] overflow-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-2xl text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <div className="flex space-x-4 mb-4">
              <p className="text-sm text-white">{selectedPicture.username}</p>
              <p className="text-sm text-white">{formatDate(selectedPicture.created_at)}</p>
            </div>
            <img
              src={selectedPicture.url}
              alt={selectedPicture.title}
              className="max-h-[60vh] w-auto mx-auto rounded-sm mb-4"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
