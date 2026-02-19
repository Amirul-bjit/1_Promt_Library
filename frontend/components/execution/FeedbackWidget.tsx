"use client";

import { useState } from "react";
import { HandThumbUpIcon, HandThumbDownIcon, StarIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as ThumbUpSolid, HandThumbDownIcon as ThumbDownSolid, StarIcon as StarSolid } from "@heroicons/react/24/solid";
import { clsx } from "clsx";

interface FeedbackWidgetProps {
  onFeedback: (feedback: {
    thumbs?: "up" | "down";
    rating?: number;
    comment?: string;
  }) => void;
  initialThumb?: "up" | "down";
  initialRating?: number;
  initialComment?: string;
}

export default function FeedbackWidget({
  onFeedback,
  initialThumb,
  initialRating,
  initialComment,
}: FeedbackWidgetProps) {
  const [thumbs, setThumbs] = useState<"up" | "down" | undefined>(initialThumb);
  const [rating, setRating] = useState<number>(initialRating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(initialComment || "");
  const [showComment, setShowComment] = useState<boolean>(false);

  const handleThumbClick = (value: "up" | "down") => {
    const newThumb = thumbs === value ? undefined : value;
    setThumbs(newThumb);
    onFeedback({ thumbs: newThumb, rating, comment });
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    onFeedback({ thumbs, rating: value, comment });
  };

  const handleCommentSubmit = () => {
    onFeedback({ thumbs, rating, comment });
    setShowComment(false);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Feedback</h3>

      {/* Thumbs up/down */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => handleThumbClick("up")}
          className={clsx(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            thumbs === "up"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {thumbs === "up" ? (
            <ThumbUpSolid className="h-5 w-5" />
          ) : (
            <HandThumbUpIcon className="h-5 w-5" />
          )}
          Helpful
        </button>

        <button
          onClick={() => handleThumbClick("down")}
          className={clsx(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            thumbs === "down"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {thumbs === "down" ? (
            <ThumbDownSolid className="h-5 w-5" />
          ) : (
            <HandThumbDownIcon className="h-5 w-5" />
          )}
          Not Helpful
        </button>
      </div>

      {/* Star rating */}
      <div className="mb-4">
        <div className="text-xs font-medium text-gray-700 mb-2">
          Rate this output:
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="text-gray-300 hover:text-yellow-400 transition-colors"
            >
              {star <= (hoveredRating || rating) ? (
                <StarSolid className="h-6 w-6 text-yellow-400" />
              ) : (
                <StarIcon className="h-6 w-6" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      {!showComment ? (
        <button
          onClick={() => setShowComment(true)}
          className="text-sm text-indigo-600 hover:text-indigo-700"
        >
          Add comment
        </button>
      ) : (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleCommentSubmit}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
            >
              Submit
            </button>
            <button
              onClick={() => setShowComment(false)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
