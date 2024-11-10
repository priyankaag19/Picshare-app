import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaHeart } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const Favorite = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [error, setError] = useState<string>("");
  const [tooltip, setTooltip] = useState<string>("");
  const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || "Guest";

  useEffect(() => {
    if (!userId) return;

    const fetchFavorites = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/favorites/${userId}`);
        setFavorites(data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError("Failed to fetch favorites. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [userId]);

  const handleFavoriteToggle = async (pictureId: number) => {
    if (!userId) return;

    try {
      await axios.delete("http://localhost:5000/api/favorites", {
        headers: {
          'Content-Type': 'application/json',
        },
        data: { userId, pictureId },
      });
      setFavorites(favorites.filter((fav: any) => fav.id !== pictureId));
      setTooltip("Picture removed from favorites!");
      setTooltipVisible(true);
      setTimeout(() => setTooltipVisible(false), 1000);
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-[#1890FF] border-b-2 border-blue-500 pb-1"
      : "text-gray-800";

  return (
    <div>
      <header className="flex justify-between items-center bg-white shadow-md py-4 w-full">
        <div className="flex items-center">
          <div className="text-center mr-8 ml-4 font-serif text-[30px] font-semibold leading-[35.13px] decoration-black">PicShare</div>
          <button onClick={() => navigate("/home")} className={`ml-4 ${isActive("/home")}`}>Home</button>
          <button onClick={() => navigate("/favorites")} className={`ml-4 ${isActive("/favorites")}`}>Favorites</button>
        </div>
        <div className="flex items-center">
          <button className="ml-6 py-1 px-4 bg-[#1890FF] text-white rounded-sm">Share Pic</button>
          <p className="mr-6 ml-6">Hi {userName}</p>
          <p onClick={handleLogOut} className="text-[#1890FF] cursor-pointer inline mr-6">Log out</p>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <h2 className="text-xl font-semibold my-4">You Saved Pictures</h2>
        {error && <p className="text-red-500">{error}</p>}
        {loading ? (
          <p>Loading Favorite Pics...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {favorites.length === 0 ? (
              <p>No favorites found.</p>
            ) : (
              favorites.map((favorite: any) => (
                <div key={favorite.id} className="bg-white p-4 rounded-md shadow-md">
                  <img
                    src={favorite.url}
                    alt={favorite.title}
                    className="w-full h-[260px] rounded-sm"
                  />
                  <p className="text-lg text-center mx-auto font-semibold mt-2">{favorite.title}</p>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-sm text-gray-600">
                      <p>{favorite.username}</p>
                      <p>{new Date(favorite.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => handleFavoriteToggle(favorite.id)}
                      className="text-red-500"
                    >
                      <FaHeart />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Tooltip for success message */}
      {tooltipVisible && (
        <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-md">
          {tooltip}
        </div>
      )}
    </div>
  );
};

export default Favorite;
