import { useEffect, useMemo, useState } from "react";
import { fetchAttendancePhotoBlob } from "../../services/boardApi";

function photoRequestKey(postId, photo) {
  if (photo?.id) return `${postId}-${photo.id}`;
  return `${postId}-legacy`;
}

function photoFetchPath(postId, photo) {
  return photo?.id ? photo.id : null;
}

export default function AttendancePhotoGallery({ postId, photos = [] }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const photoList = useMemo(
    () => (Array.isArray(photos) ? photos.filter(Boolean) : []),
    [photos],
  );

  useEffect(() => {
    if (!photoList.length) {
      setItems([]);
      setError("");
      return undefined;
    }

    let cancelled = false;
    const objectUrls = [];

    setItems([]);
    setError("");

    Promise.all(
      photoList.map(async (photo, index) => {
        const blob = await fetchAttendancePhotoBlob(postId, photoFetchPath(postId, photo));
        const url = URL.createObjectURL(blob);
        objectUrls.push(url);
        return {
          key: photoRequestKey(postId, photo) || `${postId}-${index}`,
          url,
          alt: photo.photoName || `현장 사진 ${index + 1}`,
        };
      }),
    )
      .then((loaded) => {
        if (!cancelled) setItems(loaded);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setItems([]);
          setError(loadError.message);
        }
      });

    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [postId, photoList]);

  const scrollable = photoList.length > 5;

  if (error) {
    return <p className="board-loading">{error}</p>;
  }

  if (!photoList.length) {
    return null;
  }

  if (!items.length && !error) {
    return <p className="board-loading">사진 불러오는 중...</p>;
  }

  return (
    <div
      className={`attendance-photo-gallery${scrollable ? " attendance-photo-gallery--scroll" : ""}`}
    >
      {items.map((item) => (
        <figure key={item.key} className="attendance-photo-item">
          <img src={item.url} alt={item.alt} className="attendance-photo" loading="lazy" />
        </figure>
      ))}
    </div>
  );
}
