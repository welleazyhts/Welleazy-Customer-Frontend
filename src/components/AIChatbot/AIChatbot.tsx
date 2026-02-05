import React, { useState, useRef, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faRobot, faUser, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import './AIChatbot.css';

interface Message {
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const initialMessages = [
  {
    text: "Hello! I'm your Welleazy AI health assistant. How can I help you today?",
    isBot: true,
    timestamp: new Date()
  }
];

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const simulateAIResponse = (query: string) => {
    // Predefined responses based on health-related queries
    const healthResponses = [
      "Based on your symptoms, I recommend scheduling a consultation with a doctor. Would you like me to help you book an appointment?",
      "Regular exercise and a balanced diet are essential for maintaining good health. Would you like some specific recommendations?",
      "I understand you might be concerned. These symptoms are common for seasonal allergies, but it's always best to consult with a healthcare professional.",
      "Your well-being is important. I've analyzed your health records and noticed it's time for your annual check-up. Would you like to schedule one?",
      "Staying hydrated is key to managing these symptoms. I recommend drinking plenty of water and monitoring your condition for the next 24 hours."
    ];
    
    const randomResponse = healthResponses[Math.floor(Math.random() * healthResponses.length)];
    
    setIsTyping(true);
    
    // Simulate AI thinking time
    setTimeout(() => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: randomResponse,
          isBot: true,
          timestamp: new Date()
        }
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message
    const newMessage: Message = {
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage('');
    
    // Simulate AI response
    simulateAIResponse(inputMessage);
  };

  return (
    <div className="ai-chatbot-container">
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-title">
              <FontAwesomeIcon icon={faRobot} className="chatbot-icon" />
              <h5>Health Assistant AI</h5>
            </div>
            <Button variant="link" className="close-button" onClick={toggleChatbot}>
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </div>
          
          <div className="chatbot-body">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.isBot ? 'bot-message' : 'user-message'}`}
              >
                <div className="message-icon">
                  <FontAwesomeIcon icon={message.isBot ? faRobot : faUser} />
                </div>
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot-message typing-indicator">
                <div className="message-icon">
                  <FontAwesomeIcon icon={faRobot} />
                </div>
                <div className="typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-footer">
            <Form onSubmit={handleSubmit} className="input-form">
              <Form.Control
                type="text"
                placeholder="Type your health question..."
                value={inputMessage}
                onChange={handleInputChange}
                className="message-input"
              />
              <Button type="submit" className="send-button">
                <FontAwesomeIcon icon={faPaperPlane} />
              </Button>
            </Form>
          </div>
        </div>
      ) : (
        <Button 
          className="chatbot-toggle-button" 
          onClick={toggleChatbot}
        >
          <FontAwesomeIcon icon={faRobot} className="icon" />
          <span>AI Health Assistant</span>
          <FontAwesomeIcon icon={faAngleDown} className="arrow" />
        </Button>
      )}
    </div>
  );
};

export default AIChatbot; 