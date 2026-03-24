// Pointage.jsx
import React, { useState, useRef } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Spinner,
  ProgressBar,
  Badge
} from "react-bootstrap";
import {
  FaFileExcel,
  FaUpload,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaCalendarAlt,
  FaUsers,
  FaChartBar
} from "react-icons/fa";

const PointagePage = () => {
  // États
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadResult, setUploadResult] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  
  // Référence pour l'input file
  const fileInputRef = useRef(null);

  // Gérer l'upload du fichier
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileInfo({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2), // Taille en MB
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleDateString('fr-FR')
    });

    await sendFileToBackend(file);
  };

  // Envoyer le fichier au backend
  const sendFileToBackend = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setMessage({ type: "", text: "" });
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        "http://localhost:8080/api/pointages",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      // Succès
      setUploadResult(response.data);
      setMessage({
        type: "success",
        text: `Fichier envoyé avec succès !`
      });

      // Afficher les résultats
      if (response.data) {
        console.log("Réponse du serveur:", response.data);
      }

    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      
      let errorMessage = "Erreur lors de l'envoi du fichier";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage({
        type: "error",
        text: errorMessage
      });
    } finally {
      setUploading(false);
    }
  };

  // Télécharger le template Excel
  const downloadTemplate = () => {
    // Créer un template Excel simple
    const templateData = [
      ["Matricule", "Nom", "Prénom", "Date", "Heure Arrivée", "Heure Départ", "Département"],
      ["EMP001", "Dupont", "Jean", "2024-01-15", "08:30", "17:30", "RH"],
      ["EMP002", "Martin", "Marie", "2024-01-15", "09:00", "18:00", "IT"]
    ];
    
    // Créer le contenu CSV
    const csvContent = templateData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_pointage.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Réinitialiser
  const handleReset = () => {
    setUploading(false);
    setUploadProgress(0);
    setMessage({ type: "", text: "" });
    setUploadResult(null);
    setFileInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-6">
            <FaClock className="me-2" />
            Import des Pointages
          </h1>
          <p className="text-muted">
            Importez directement votre fichier Excel de pointage
          </p>
        </Col>
      </Row>

      {/* Messages */}
      {message.text && (
        <Row className="mb-3">
          <Col>
            <Alert variant={
              message.type === "success" ? "success" :
              message.type === "error" ? "danger" : "info"
            } dismissible onClose={() => setMessage({ type: "", text: "" })}>
              {message.text}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Zone d'upload principale */}
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            <FaFileExcel className="me-2 text-success" />
            Upload du Fichier Excel
          </h5>
        </Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="border rounded p-5 text-center">
                <FaFileExcel size={64} className="text-success mb-4" />
                <h4>Déposez votre fichier ici</h4>
                <p className="text-muted mb-4">
                  Formats supportés: .xlsx, .xls, .csv
                </p>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv"
                  className="d-none"
                  id="fileInput"
                  disabled={uploading}
                />
                
                <Button
                  variant="success"
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="me-2"
                >
                  <FaUpload className="me-2" />
                  {uploading ? "Envoi en cours..." : "Sélectionner un fichier"}
                </Button>
                
                <Button
                  variant="outline-primary"
                  size="lg"
                  onClick={downloadTemplate}
                  disabled={uploading}
                >
                  <FaDownload className="me-2" />
                  Template
                </Button>
                
                {/* Barre de progression */}
                {uploading && (
                  <div className="mt-4">
                    <ProgressBar 
                      now={uploadProgress} 
                      label={`${uploadProgress}%`}
                      animated 
                      striped
                    />
                    <small className="text-muted mt-2 d-block">
                      Envoi en cours... {uploadProgress}%
                    </small>
                  </div>
                )}
              </div>
            </Col>
            
            <Col md={6}>
              <div className="ps-4">
                <h5>Instructions :</h5>
                <ul className="text-muted mb-4">
                  <li>Format du fichier : Excel (.xlsx, .xls) ou CSV</li>
                  <li>Colonnes requises :
                    <ul>
                      <li><strong>Matricule</strong> : Identifiant de l'employé</li>
                      <li><strong>Nom</strong> : Nom de l'employé</li>
                      <li><strong>Prénom</strong> : Prénom de l'employé</li>
                      <li><strong>Date</strong> : Date du pointage (format: YYYY-MM-DD)</li>
                      <li><strong>Heure Arrivée</strong> : Heure d'arrivée (format: HH:MM)</li>
                      <li><strong>Heure Départ</strong> : Heure de départ (format: HH:MM)</li>
                    </ul>
                  </li>
                  <li>La validation se fera automatiquement côté serveur</li>
                  <li>Les résultats seront affichés après l'upload</li>
                </ul>
                
                {/* Informations du fichier */}
                {fileInfo && !uploading && (
                  <Card className="border-primary">
                    <Card.Body>
                      <h6>Fichier sélectionné :</h6>
                      <div className="d-flex align-items-center">
                        <FaFileExcel className="text-success me-2" />
                        <div>
                          <strong>{fileInfo.name}</strong>
                          <div className="small text-muted">
                            {fileInfo.size} MB • Modifié le {fileInfo.lastModified}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Résultats de l'upload */}
      {/* // Remplacer la gestion des résultats (~186-260) */}
{uploadResult && (
  <Card className="mb-4 border-success">
    <Card.Header className="bg-success text-white">
      <h5 className="mb-0">
        <FaCheckCircle className="me-2" />
        Résultats de l'Import
      </h5>
    </Card.Header>
    <Card.Body>
      <Row>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaUsers size={32} className="text-primary mb-2" />
              <Card.Title>{uploadResult.totalCount || 0}</Card.Title>
              <Card.Text className="text-muted">Lignes traitées</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaCheckCircle size={32} className="text-success mb-2" />
              {/* CHANGEMENT ICI : validCount au lieu de savedCount */}
              <Card.Title>{uploadResult.validCount || 0}</Card.Title>
              <Card.Text className="text-muted">Lignes sauvegardées</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaTimesCircle size={32} className="text-danger mb-2" />
              {/* CHANGEMENT ICI : errorCount au lieu de rejectedCount */}
              <Card.Title>{uploadResult.errorCount || 0}</Card.Title>
              <Card.Text className="text-muted">Lignes rejetées</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaChartBar size={32} className="text-warning mb-2" />
              <Card.Title>
                {uploadResult.validCount > 0 && uploadResult.totalCount > 0
                  ? `${Math.round((uploadResult.validCount / uploadResult.totalCount) * 100)}%`
                  : "0%"
                }
              </Card.Title>
              <Card.Text className="text-muted">Taux de succès</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* CHANGEMENT ICI : Afficher les erreurs depuis errorDetails */}
      {uploadResult.errorDetails && uploadResult.errorDetails.length > 0 && (
        <div className="mt-4">
          <h6>Détails des erreurs :</h6>
          <div className="alert alert-warning">
            <ul className="mb-0">
              {uploadResult.errorDetails.slice(0, 5).map((errorDetail, index) => (
                <li key={index}>
                  <strong>Ligne {errorDetail.rowNumber}:</strong> 
                  {errorDetail.errors && errorDetail.errors.length > 0 
                    ? ` ${errorDetail.errors.join(", ")}` 
                    : " Erreur inconnue"}
                </li>
              ))}
              {uploadResult.errorDetails.length > 5 && (
                <li>... et {uploadResult.errorDetails.length - 5} autres erreurs</li>
              )}
            </ul>
          </div>
        </div>
      )}
      
      {/* Ajouter l'affichage des erreurs globales */}
      {uploadResult.globalErrors && uploadResult.globalErrors.length > 0 && (
        <div className="mt-3">
          <h6>Erreurs globales :</h6>
          <Alert variant="danger">
            <ul className="mb-0">
              {uploadResult.globalErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}
      
      {/* Message de succès */}
      {uploadResult.message && (
        <div className="mt-3">
          <Alert variant="info">
            {uploadResult.message}
          </Alert>
        </div>
      )}
    </Card.Body>
  </Card>
)}

      {/* Boutons d'action */}
      <Row className="mb-4">
        <Col className="text-center">
          <Button
            variant="outline-secondary"
            onClick={handleReset}
            className="me-2"
          >
            Réinitialiser
          </Button>
          
          <Button
            variant="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaUpload className="me-2" />
            Importer un autre fichier
          </Button>
        </Col>
      </Row>

      {/* Guide rapide */}
      <Card className="border-info">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">
            <FaCalendarAlt className="me-2" />
            Format attendu
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr className="table-primary">
                  <th>Matricule</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date</th>
                  <th>Heure Arrivée</th>
                  <th>Heure Départ</th>
                  <th>Département</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>EMP001</td>
                  <td>Dupont</td>
                  <td>Jean</td>
                  <td>2024-01-15</td>
                  <td>08:30</td>
                  <td>17:30</td>
                  <td>RH</td>
                </tr>
                <tr>
                  <td>EMP002</td>
                  <td>Martin</td>
                  <td>Marie</td>
                  <td>2024-01-15</td>
                  <td>09:00</td>
                  <td>18:00</td>
                  <td>IT</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-3">
            <Badge bg="info" className="me-2">Format Date: YYYY-MM-DD</Badge>
            <Badge bg="info" className="me-2">Format Heure: HH:MM (24h)</Badge>
            <Badge bg="info">Encodage: UTF-8</Badge>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PointagePage;
