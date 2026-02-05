import React from "react";
import "./CreativeFeedback.css";

interface Props {
  onClose: () => void;
}

const CreativeFeedback: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="feedback-wrapper">
      <h2>We Value Your Feedback 💬</h2>

      <div className="question-block">
        <p>1. How satisfied are you with our service?</p>
        <div className="radio-group colorful">
          <label><input type="radio" name="satisfaction" /> Satisfied</label>
          <label><input type="radio" name="satisfaction" /> Neutral</label>
          <label><input type="radio" name="satisfaction" /> Unsatisfied</label>
        </div>
      </div>

      <div className="question-block">
        <p>2. Was the service provided in a timely manner?</p>
        <div className="radio-group">
          <label><input type="radio" name="timely" /> Yes</label>
          <label><input type="radio" name="timely" /> No</label>
        </div>
      </div>

      <div className="question-block">
        <p>3. How would you rate the professionalism of our staff?</p>
        <div className="rating-bar">
          <label><input type="radio" name="professionalism" /> Excellent</label>
          <label><input type="radio" name="professionalism" /> Good</label>
          <label><input type="radio" name="professionalism" /> Average</label>
          <label><input type="radio" name="professionalism" /> Poor</label>
          <label><input type="radio" name="professionalism" /> Very Poor</label>
        </div>
      </div>

      <div className="question-block">
        <p>4. Suggestions for improving our service:</p>
        <textarea placeholder="Your remarks..." rows={4}></textarea>
      </div>

      <div className="feedback-actions">
        <button className="btn-submit">Submit</button>
        <button className="btn-back" onClick={onClose}>Back</button>
      </div>
    </div>
  );
};

export default CreativeFeedback;
