import React, { useState } from 'react';
import './css/ReviewModal.css'; 
import axios from '../utils/axiosConfig'; 

const ReviewModal = ({ isOpen, onClose, order }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const handleRating = (rate) => {
    setRating(rate);
  };

  const handleSubmit = async () => {
    if (rating === 0 || !order.dasherId) {
      alert("Please provide a rating and ensure the order has a dasher ID.");
      return;
    }

    
    const ratingData = {
      dasherId: order.dasherId, // Get dasher ID from order
      rate: rating,
      comment: reviewText,
      type: "dasher",
      orderId: order.id
    };
    console.log('Rating data:', ratingData);

    try {
      const response = await axios.post('/ratings/dasher-create', ratingData);
      console.log('Rating submitted:', response.data);
      await axios.post('/orders/update-order-status', {
        orderId: order.id,
        status: "completed"
        });
      onClose(); // Close the modal after submission
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert("Failed to submit rating.");
    }
  };

  return (
    isOpen && (
      <div className="rrm-modal-overlay">
        <div className="rrm-modal-content">
          <div className="rrm-modal-header">
            <h3 className="rrm-store-name">Rate your dasher</h3> 
            <span className="rrm-modal-close" onClick={onClose}>&times;</span>
          </div>

          <div className="rrm-modal-rating-section">
            <h3>Rate your dasher</h3>
            <div className="rrm-modal-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`rrm-modal-star ${rating >= star ? 'filled' : ''}`}
                  onClick={() => handleRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <textarea
            className="rrm-modal-textarea"
            placeholder="Write your review here..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          ></textarea>

          <div className="rrm-modal-buttons">
            <button className="rrm-modal-button rrm-continue" onClick={handleSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ReviewModal;
