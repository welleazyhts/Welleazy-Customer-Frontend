import React, { useState } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import './ViewDocuments.css'; // Styling will be handled here
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';


const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const locationData = [
  { name: 'New Delhi', img: '/DELHI-8.png' },
  { name: 'Chandigarh', img: '/Chandigarh.png' },
  { name: 'Srinagar', img: '/srinagr.png' },
  { name: 'Cochin', img: '/kochi.png' },
  { name: 'Bangalore', img: '/BANGALORE-8.png' },
  { name: 'Mumbai', img: '/mumbai.png' },
  { name: 'Kolkata', img: '/KOLKATA-8.png' },
  { name: 'Ahmedabad', img: '/AHEMDABAD-8.png' },
  { name: 'Jaipur', img: '/JAIPUR-8.png' },
  { name: 'Lucknow', img: '/LUCKNOW-8.png' },
];

const ViewDocuments: React.FC = () => {
    const [selectedState, setSelectedState] = useState("Bangalore/Bengaluru");
    const [showDropdown, setShowDropdown] = useState(false);
    const [visibleStart, setVisibleStart] = useState(0);
    const [locationCarouselIndex, setLocationCarouselIndex] = useState<number>(0);
    const LOCATIONS_VISIBLE = 3;
    const visibleCount = 4; // Number of location cards visible at once

    // Hardcoded documents data for the table
    const documents = [
        {
            documentFor: 'Self',
            name: 'Firoz Khan Ummer',
            file: 'EMP000103641_PR2907240548.pdf',
        },
        {
            documentFor: 'Spouse',
            name: 'Testing Dependent New',
            file: 'EMP000103641_PR2907240548.pdf',
        },
        {
            documentFor: 'Self',
            name: 'Firoz Khan Ummer',
            file: 'WEZ103641_Hari krishna Dot Net Devlepoer.pdf',
        },
        {
            documentFor: 'Child',
            name: 'Dependent Child 1',
            file: 'CHILD_DOC_12345.pdf',
        },
        {
            documentFor: 'Parent',
            name: 'Dependent Parent 1',
            file: 'PARENT_DOC_67890.pdf',
        },
        {
            documentFor: 'Self',
            name: 'Another Self Document',
            file: 'ANOTHER_SELF_DOC.pdf',
        },
    ];

    // Pagination state for the documents table
    const [currentPage, setCurrentPage] = useState(1);
    const documentsPerPage = 3; // Number of documents to display per page

    // Calculate the documents to display on the current page
    const indexOfLastDocument = currentPage * documentsPerPage;
    const indexOfFirstDocument = indexOfLastDocument - documentsPerPage;
    const currentDocuments = documents.slice(indexOfFirstDocument, indexOfLastDocument);

    // Calculate total pages
    const totalPages = Math.ceil(documents.length / documentsPerPage);

    const navigate = useNavigate();

    // Handlers for location carousel
    const getVisibleLocations = () => {
        return locationData.slice(visibleStart, visibleStart + visibleCount);
    };


    const handlePrev = () => {
        setLocationCarouselIndex(prev => prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1);
      };
      const handleNext = () => {
        setLocationCarouselIndex(prev => prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1);
      };

    // Handlers for state dropdown
    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const handleStateSelect = (state: string) => {
        setSelectedState(state);
        setShowDropdown(false);
    };

    // Handlers for document table pagination
    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className="view-documents-wrapper">
            {/* Location Bar with Dropdown */}
            <div className="location-bar">
                <span className="location-icon">📍</span>
                <span className="location-text" onClick={toggleDropdown}>
                    {selectedState}
                </span>
                <button className="change-btn">CHANGE</button>
                {showDropdown && (
                    <div className="state-dropdown">
                        {states.map((state, idx) => (
                            <div
                                key={idx}
                                className="dropdown-item"
                                onClick={() => handleStateSelect(state)}
                            >
                                {state}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Page Title and Underline */}
            <h2 className="page-title">
                View Uploaded Policy Document / Medical Cards
            </h2>
            <div className="underline" />

            {/* Empanel Hospital List Button */}
            <button className="hospital-btn">Empanel Hospital List</button>

            {/* Medical Cards Table Section */}
            <div className="table-section">
                <h3>Medical Cards :</h3>
                <table className="documents-table">
                    <thead>
                        <tr>
                            <th>Document For</th>
                            <th>Name</th>
                            <th>Documents</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentDocuments.map((doc, index) => (
                            <tr key={index}>
                                <td>{doc.documentFor}</td>
                                <td>{doc.name}</td>
                                <td>
                                    <a href={`#`} className="doc-link">
                                        {doc.file}
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination Controls for Medical Cards Table */}
                <div className="pagination-controls">
                    <button
                        className="pagination-button"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`pagination-button ${currentPage === i + 1 ? 'current-page-indicator' : ''}`}
                            onClick={() => handlePageChange(i + 1)}
                            style={{ backgroundColor: currentPage === i + 1 ? '#f16522' : '#0052cc' }}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="pagination-button"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Back Button */}
            <div className="back-button-container">
                <button className="back-btn" onClick={() => navigate('/insurance-record')}>
                    Back
                </button>
            </div>

           {/* Our Locations Section */}
       <Container>
        <section className="our-location-sections" style={{ marginBottom: '48px'}}>
       
          <h2 className="our-location-headings">Our Locations</h2>
          <div className="location-carousel-wrappers">
            <button className="carousel-arrow left" onClick={handlePrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <div className="location-carousel large-carousel">
              {getVisibleLocations().map((loc, idx) => (
                <div className="location-card large-location-card" key={idx}>
                  <img src={loc.img} alt={loc.name} className="location-img large-location-img" />
                  <div className="location-name large-location-name">{loc.name}</div>
                </div>
              ))}
            </div>
            <button className="carousel-arrow right" onClick={handleNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
          
        </section>
      </Container>
        </div>
    );
};

export default ViewDocuments;
