import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./InsuranceRecords.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faChevronUp,
  faChevronDown,
  faEdit,
  faTrash,
  faChevronLeft,
  faChevronRight,
  faFileAlt,
  faCalendarAlt,
  faBuilding,
  faUser,
  faClock,
  faCheckCircle,
  faTimesCircle,
  faDownload,
  faEye,
  faFilter
} from "@fortawesome/free-solid-svg-icons";
import { Container } from "react-bootstrap";
import { insuranceRecordAPI } from "../../api/InsuranceRecord";
import { RecordType, MemberType } from "../../types/InsuranceRecord";
import { toast } from "react-toastify";


const InsuranceRecords: React.FC = () => {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<RecordType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [members, setMembers] = useState<MemberType[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [selectedRelation, setSelectedRelation] = useState<string | null>(null);
  const [showAllMembers, setShowAllMembers] = useState<boolean>(true);
  const recordsPerPage = 5;

  const membersRowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch members (employeeself and dependents)
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const memberData = await insuranceRecordAPI.CRMGetEmployeeSelfAndDependentList();
        if (memberData && Array.isArray(memberData)) {
          const formattedMembers = memberData.map((member: any) => ({
            name: member.EmployeeName?.trim() || "Unknown",
            relation: member.Relation || "Dependent",
            employeeId: member.EmployeeId,
            dob: member.DOB,
            age: member.Age,
            gender: member.Gender,
            isActive: false,
          }));
          setMembers(formattedMembers);
        } else {
          setMembers([]);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    fetchMembers();
  }, []);

  // Fetch insurance records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const apiRecords = await insuranceRecordAPI.CRMGetCustomerInsuranceRecordDetails();
        if (apiRecords && apiRecords.length > 0) {
          const formattedRecords = apiRecords.map((rec: any) => ({
            id: rec.InsuranceRecordId,
            member: rec.PolicyHolderName || "Unknown",
            insurer: rec.InsuranceCompanyName || "N/A",
            policyFrom: rec.PolicyFrom || "-",
            policyTo: rec.PolicyTo || "-",
            lastUpdateDate: rec.LastUpdateDate || "-",
            lastUpdateTime: rec.LastUpdateTime || "-",
            status: rec.IsActive === 1 ? "Active" : rec.IsActive === 2 ? "Expired" : "Inactive",
            insuranceType: rec.InsuranceType || null,
            policyType: rec.PolicyType || "Self",
            expanded: false,
            details: null,
          }));
          setRecords(formattedRecords);
          setFilteredRecords(formattedRecords);
        } else {
          setRecords([]);
          setFilteredRecords([]);
        }
      } catch (error) {
        console.error("Error fetching insurance records:", error);
      }
    };

    fetchRecords();
  }, []);

  // Handle member click filter
  const handleMemberClick = (memberName: string, relation: string) => {
    if (selectedMember === memberName && selectedRelation === relation) {
      // If clicking the same card, show all records
      setSelectedMember(null);
      setSelectedRelation(null);
      setShowAllMembers(true);
      setFilteredRecords(records);

      setMembers(prev => prev.map(member => ({
        ...member,
        isActive: false
      })));
    } else {
      // Filter records by selected member and relation
      setSelectedMember(memberName);
      setSelectedRelation(relation);
      setShowAllMembers(false);

      const filtered = records.filter(record => {
        if (relation === "Company Policy") {
          return record.policyType === "Company Policy";
        }

        if (relation === "Self") {
          return record.policyType === "Self" &&
            (record.member.toLowerCase().includes(memberName.toLowerCase()) ||
              memberName.toLowerCase().includes(record.member.toLowerCase()));
        }

        // Default: filter by name for Dependents
        return record.member.toLowerCase().includes(memberName.toLowerCase()) ||
          memberName.toLowerCase().includes(record.member.toLowerCase());
      });

      setFilteredRecords(filtered);
      setCurrentPage(1);

      // Update members active state
      setMembers(prev => prev.map(member => ({
        ...member,
        isActive: member.name === memberName && member.relation === relation
      })));
    }
  };

  // Handle "Show All" button click
  const handleShowAll = () => {
    setSelectedMember(null);
    setSelectedRelation(null);
    setShowAllMembers(true);
    setFilteredRecords(records);

    setMembers(prev => prev.map(member => ({
      ...member,
      isActive: false
    })));
  };

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleAddRecord = () => navigate("/insurance-records/add");

  const handleEditRecord = (insuranceId: number) => {
    navigate(`/insurance-records/add?insuranceId=${insuranceId}`);
  };

  const handleDelete = async (index: number) => {
    const recordIndex = indexOfFirstRecord + index;
    const recordToDelete = filteredRecords[recordIndex];

    const isConfirmed = window.confirm(`Are you sure you want to delete the insurance record for ${recordToDelete.member}?`);
    if (!isConfirmed) return;

    try {
      const loginRefId = localStorage.getItem("LoginRefId") || "0";
      const createdBy = parseInt(loginRefId);

      const response = await insuranceRecordAPI.CRMCustomerInsuranceEmployeeDeactive(
        recordToDelete.id,
        createdBy
      );

      if (response?.Message || response?.message) {
        toast.success(response.Message || response.message || "Record deleted successfully");
        const updatedRecords = records.filter(record => record.id !== recordToDelete.id);
        const updatedFilteredRecords = filteredRecords.filter(record => record.id !== recordToDelete.id);
        setRecords(updatedRecords);
        setFilteredRecords(updatedFilteredRecords);
      } else {
        toast.error("Failed to delete record. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      toast.error("Error deleting record. Please try again.");
    }
  };

  const handleToggleExpand = async (index: number) => {
    const recordIndex = indexOfFirstRecord + index;
    const record = filteredRecords[recordIndex];

    if (record.expanded) {
      setFilteredRecords(prev =>
        prev.map((r, i) =>
          i === recordIndex ? { ...r, expanded: false } : r
        )
      );
      return;
    }

    try {
      setLoadingId(record.id);
      const response = await insuranceRecordAPI.CRMGetCustomerInsuranceRecordDetailsById(record.id);
      const details = response["Insurance Records Details"]?.[0] || null;
      let documents = response["Insurance Records Documents"] || response["Insurance Records Documnets"] || [];

      // Fallback: Check if documents are inside details
      if (documents.length === 0 && details?.documents) documents = details.documents;
      if (documents.length === 0 && details?.insurance_documents) documents = details.insurance_documents;
      if (documents.length === 0 && details?.DocumentFiles) documents = details.DocumentFiles;

      setFilteredRecords(prev =>
        prev.map((r, i) =>
          i === recordIndex
            ? { ...r, expanded: true, details, documents }
            : { ...r, expanded: false }
        )
      );
    } catch (error) {
      console.error("Failed to fetch record details:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const locationData = [
    { name: "New Delhi", img: "/DELHI-8.png" },
    { name: "Chandigarh", img: "/Chandigarh.png" },
    { name: "Srinagar", img: "/srinagr.png" },
    { name: "Cochin", img: "/kochi.png" },
    { name: "Bangalore", img: "/BANGALORE-8.png" },
    { name: "Mumbai", img: "/mumbai.png" },
    { name: "Kolkata", img: "/KOLKATA-8.png" },
    { name: "Ahmedabad", img: "/AHEMDABAD-8.png" },
    { name: "Jaipur", img: "/JAIPUR-8.png" },
    { name: "Lucknow", img: "/LUCKNOW-8.png" },
  ];

  const LOCATIONS_VISIBLE = 4;
  const [locationCarouselIndex, setLocationCarouselIndex] = useState(0);
  const handlePrev = () =>
    setLocationCarouselIndex((prev) =>
      prev === 0 ? locationData.length - LOCATIONS_VISIBLE : prev - 1
    );
  const handleNext = () =>
    setLocationCarouselIndex((prev) =>
      prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
    );

  useEffect(() => {
    const interval = setInterval(() => {
      setLocationCarouselIndex((prev) =>
        prev >= locationData.length - LOCATIONS_VISIBLE ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getVisibleLocations = () => {
    const visible = [];
    for (let i = 0; i < LOCATIONS_VISIBLE; i++) {
      visible.push(locationData[(locationCarouselIndex + i) % locationData.length]);
    }
    return visible;
  };


  const downloadDocument = async (insuranceRecordDocumentId: number, fileName?: string) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://3.110.32.224"}/Insurance/DownloadInsuranceDocument/${insuranceRecordDocumentId}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "document";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading document:", error);
    }
  };

  return (
    <div className="ins-main-container">
      <div className="ins-header-row">
        <div>
          <h1>Insurance Records</h1>
        </div>
        <div className="ins-header-actions">
          <button className="ins-action-btn" onClick={handleAddRecord}>
            <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: "8px" }} />
            Add New Record
          </button>
        </div>
      </div>

      <div className="ins-members-section">
        <div className="ins-members-header">
          <h3 className="ins-section-title">
            <FontAwesomeIcon icon={faUser} style={{ marginRight: "10px" }} />
            Family Members
          </h3>
          <div className="ins-members-filter-info">
            {selectedMember && (
              <div className="ins-active-filter">
                <FontAwesomeIcon icon={faFilter} style={{ marginRight: "6px" }} />
                Showing records for: <strong>{selectedMember} ({selectedRelation})</strong>
                <button
                  className="ins-clear-filter-btn"
                  onClick={handleShowAll}
                >
                  Show All
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="ins-members-row" ref={membersRowRef}>
          {members.map((member, idx) => (
            <div
              className={`ins-member-card ${member.isActive ? 'active' : ''}`}
              key={idx}
              onClick={() => handleMemberClick(member.name, member.relation)}
              title={`Click to filter records for ${member.name}`}
            >
              <div className="ins-member-icon">
                <FontAwesomeIcon icon={faUserCircle} size="2x" />
                {member.isActive && (
                  <div className="ins-member-active-indicator"></div>
                )}
              </div>
              <div className="ins-member-info">
                <div className="ins-member-name">{member.name}</div>
                <div className="ins-member-relation">{member.relation}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ins-records-section">
        <div className="ins-records-header">
          <h3 className="ins-section-title">
            <FontAwesomeIcon icon={faFileAlt} style={{ marginRight: "10px" }} />
            Insurance Policies
            {selectedMember && (
              <span className="ins-filter-badge">
                Filtered by: {selectedMember} ({selectedRelation})
              </span>
            )}
          </h3>
          <div className="ins-stats">
            <div className="ins-stat-item">
              <span className="ins-stat-label">Total Records:</span>
              <span className="ins-stat-value">{filteredRecords.length}</span>
            </div>
            <div className="ins-stat-item">
              <span className="ins-stat-label">Active:</span>
              <span className="ins-stat-value active">
                {filteredRecords.filter(r => r.status === "Active").length}
              </span>
            </div>
            {selectedMember && (
              <div className="ins-stat-item">
                <button
                  className="ins-clear-filter-btn-small"
                  onClick={handleShowAll}
                >
                  Clear Filter
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="ins-table-container">
          <div className="ins-table-header">
            <div className="ins-table-header-cell">Member</div>
            <div className="ins-table-header-cell">Insurer</div>
            <div className="ins-table-header-cell">
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "6px" }} />
              Policy From
            </div>
            <div className="ins-table-header-cell">
              <FontAwesomeIcon icon={faCalendarAlt} style={{ marginRight: "6px" }} />
              Policy To
            </div>
            <div className="ins-table-header-cell">Last Updated</div>
            <div className="ins-table-header-cell">Status</div>
            <div className="ins-table-header-cell actions">Actions</div>
          </div>

          <div className="ins-table-body">
            {currentRecords.length === 0 ? (
              <div className="ins-empty-state">
                <FontAwesomeIcon icon={faFileAlt} size="3x" />
                <p>
                  {selectedMember
                    ? `No insurance records found for ${selectedMember}`
                    : "No insurance records found"
                  }
                </p>
                <button className="ins-action-btn" onClick={handleAddRecord}>
                  Add Your First Record
                </button>
                {selectedMember && (
                  <button
                    className="ins-clear-filter-btn"
                    onClick={handleShowAll}
                    style={{ marginTop: '10px' }}
                  >
                    Show All Records
                  </button>
                )}
              </div>
            ) : (
              currentRecords.map((rec, idx) => (
                <React.Fragment key={idx}>
                  <div className="ins-table-row">
                    <div className="ins-table-cell">
                      <div className="ins-member-cell">
                        <FontAwesomeIcon icon={faUserCircle} className="ins-cell-icon" />
                        <div>
                          <div className="ins-cell-primary">{rec.member}</div>
                        </div>
                      </div>
                    </div>
                    <div className="ins-table-cell">
                      <div className="ins-insurer-cell">
                        <FontAwesomeIcon icon={faBuilding} className="ins-cell-icon" />
                        <div className="ins-cell-primary">{rec.insurer}</div>
                      </div>
                    </div>
                    <div className="ins-table-cell">
                      <div className="ins-date-cell">
                        <FontAwesomeIcon icon={faCalendarAlt} className="ins-cell-icon" />
                        <div className="ins-cell-primary">{rec.policyFrom}</div>
                      </div>
                    </div>
                    <div className="ins-table-cell">
                      <div className="ins-date-cell">
                        <FontAwesomeIcon icon={faCalendarAlt} className="ins-cell-icon" />
                        <div className="ins-cell-primary">{rec.policyTo}</div>
                      </div>
                    </div>
                    <div className="ins-table-cell">
                      <div className="ins-update-cell">
                        <FontAwesomeIcon icon={faClock} className="ins-cell-icon" />
                        <div>
                          <div className="ins-cell-primary">{rec.lastUpdateDate}</div>
                          <div className="ins-cell-secondary">{rec.lastUpdateTime}</div>
                        </div>
                      </div>
                    </div>
                    <div className="ins-table-cell">
                      <div className={`ins-status-cell ${rec.status === "Active" ? "active" : "inactive"}`}>
                        <FontAwesomeIcon
                          icon={rec.status === "Active" ? faCheckCircle : faTimesCircle}
                          style={{ marginRight: "6px" }}
                        />
                        {rec.status}
                      </div>
                    </div>
                    <div className="ins-table-cell ins-actions-cell">
                      <button
                        className="ins-action-icon-btn"
                        onClick={() => handleToggleExpand(idx)}
                        title="View Details"
                      >
                        <FontAwesomeIcon icon={rec.expanded ? faChevronUp : faChevronDown} />
                      </button>
                      <button
                        className="ins-action-icon-btn edit"
                        onClick={() => handleEditRecord(rec.id)}
                        title="Edit Record"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        className="ins-action-icon-btn delete"
                        onClick={() => handleDelete(idx)}
                        title="Delete Record"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>

                  {rec.expanded && (
                    <div className="ins-expanded-details">
                      {loadingId === rec.id ? (
                        <div className="ins-loading-details">
                          <div className="ins-loading-spinner"></div>
                          Loading details...
                        </div>
                      ) : rec.details ? (
                        <div className="ins-details-grid">
                          <div className="ins-detail-card">
                            <h4>Policy Information</h4>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">Policy Holder:</span>
                              <span className="ins-detail-value">{rec.details.PolicyHolderName || "-"}</span>
                            </div>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">Policy Number:</span>
                              <span className="ins-detail-value">{rec.details.PolicyNumber || "-"}</span>
                            </div>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">Policy Name:</span>
                              <span className="ins-detail-value">{rec.details.PolicyName || "-"}</span>
                            </div>
                          </div>

                          <div className="ins-detail-card">
                            <h4>Coverage Details</h4>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">Insurance Type:</span>
                              <span className="ins-detail-value">
                                {rec.details?.InsuranceType || rec.insuranceType || "-"}
                              </span>
                            </div>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">Sum Assured:</span>
                              <span className="ins-detail-value">{rec.details.SumAssured || "-"}</span>
                            </div>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">Premium Amount:</span>
                              <span className="ins-detail-value">{rec.details.PremiumAmount || "-"}</span>
                            </div>
                          </div>

                          <div className="ins-detail-card">
                            <h4>Additional Information</h4>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">Insurance Company:</span>
                              <span className="ins-detail-value">{rec.details.InsuranceCompanyName || rec.insurer || "-"}</span>
                            </div>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">TPA:</span>
                              <span className="ins-detail-value">{rec.details.TPA || "-"}</span>
                            </div>
                            <div className="ins-detail-row">
                              <span className="ins-detail-label">Nominee:</span>
                              <span className="ins-detail-value">{rec.details.Nominee || "-"}</span>
                            </div>
                          </div>

                          <div className="ins-detail-card">
                            <h4>Documents</h4>
                            {rec.documents && rec.documents.length > 0 ? (
                              rec.documents.map((doc, index) => (
                                <div
                                  key={doc.InsuranceRecordDocumentId || index}
                                  className="ins-detail-row"
                                  title={doc.DocumentName}
                                >
                                  <span className="ins-detail-label">{doc.DocumentName || `Document ${index + 1}`}</span>
                                  <span className="ins-detail-value">
                                    <a
                                      href={doc.DocumentPath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ins-doc-btn view"
                                    >
                                      View
                                    </a>
                                    <a
                                      href={doc.DocumentPath}
                                      download
                                      className="ins-doc-btn download"
                                      onClick={() => downloadDocument(doc.InsuranceRecordDocumentId)}
                                    >
                                      Download
                                    </a>
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="ins-detail-row">
                                <span className="ins-detail-value" style={{ color: '#999' }}>No documents</span>
                              </div>
                            )}
                          </div>

                          <div className="ins-detail-card full-width">
                            <h4>Notes</h4>
                            <div className="ins-notes">
                              {rec.details.AdditionalNotes || "No notes available."}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="ins-no-details">No details available.</div>
                      )}
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
          </div>

          {filteredRecords.length > recordsPerPage && (
            <div className="ins-pagination">
              <div className="ins-pagination-info">
                Showing {indexOfFirstRecord + 1} to {Math.min(indexOfLastRecord, filteredRecords.length)} of {filteredRecords.length}
              </div>
              <div className="ins-pagination-controls">
                <button className="ins-pagination-btn" disabled={currentPage === 1} onClick={handlePrevPage}>
                  <FontAwesomeIcon icon={faChevronLeft} /> Prev
                </button>
                <button className="ins-pagination-btn" disabled={currentPage === totalPages} onClick={handleNextPage}>
                  Next <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Container>
        <section className="our-location-section" style={{ marginBottom: "48px" }}>
          <h2 className="our-location-heading">Our Locations</h2>
          <div className="location-carousel-wrapper">
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

export default InsuranceRecords;