// src/components/AddDocumentModal.jsx
import React, { useState, useRef } from 'react';
import { Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Upload, FileText, X, CheckCircle } from 'react-feather';
import axiosInstance from "../../../utils/AxiosInstance";

function AddDocumentModal({ show, onHide, employeeId, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    typeDocumentId: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [typesDocument, setTypesDocument] = useState([]);
  const fileInputRef = useRef(null);

  // Charger les types de documents
  React.useEffect(() => {
    if (show) {
      fetchTypesDocument();
    }
  }, [show]);

  const fetchTypesDocument = async () => {
    try {
      const response = await axiosInstance.get('/api/type-documents');
      setTypesDocument(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des types de documents:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux (max 10MB)');
        return;
      }

      // Vérifier le type (PDF uniquement)
      if (file.type !== 'application/pdf') {
        setError('Seuls les fichiers PDF sont acceptés');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!formData.typeDocumentId) {
      setError('Veuillez sélectionner un type de document');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Créer FormData
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('typeDocumentId', formData.typeDocumentId);
      formDataToSend.append('employeId', employeeId);

      // IMPORTANT: Créer une nouvelle configuration pour éviter les problèmes d'intercepteurs
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Ces options peuvent être nécessaires selon votre configuration axiosInstance
        transformRequest: [(data) => data], // Empêcher la transformation automatique
      };

      // Envoyer le document avec axiosInstance
      const response = await axiosInstance.post(
        '/api/documents/upload',
        formDataToSend,
        config
      );

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setTimeout(() => {
          resetForm();
          onSuccess();
          onHide();
        }, 1500);
      }
    } catch (err) {
      console.error('Erreur lors de l\'upload:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'upload du document');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      typeDocumentId: '',
    });
    setSelectedFile(null);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  if (!show) return null;

  return (
    <div className="modal_perso">
      <div className="modal-dialog-custom" style={{ maxWidth: '600px', width: '95%' }}>
        <div className="modal-content-custom" style={{
          background: 'white',
          border: '1px solid #e1b2db',
          color: '#3a1438',
          borderRadius: '8px'
        }}>
          {/* Header du modal */}
          <div className="modal-header-custom" style={{
            background: 'var(--bg-gradient)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.2rem 1.5rem',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}>
            <h5 className="modal-title m-0" style={{
              fontSize: '1.3rem',
              fontWeight: 600,
              color: 'white'
            }}>
              <Upload size={20} className="me-2" />
              Ajouter un document
            </h5>
            <Button
              type="button"
              onClick={handleClose}
              aria-label="Fermer"
              className="d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.18)",
                border: "none",
                boxShadow: "none",
                outline: "none",
                color: "#ffffff",
                width: 44,
                height: 44,
                borderRadius: 12,
                padding: 0
              }}
            >
              <X size={22} />
            </Button>
          </div>

          {/* Body du modal */}
          <div className="modal-body-custom" style={{
            padding: '1.5rem',
            background: 'white'
          }}>
            {success ? (
              <div className="text-center py-4">
                <CheckCircle size={64} className="text-success mb-3" />
                <h5 className="text-success mb-2">Document ajouté avec succès !</h5>
                <p className="text-muted">Le document a été uploadé et enregistré.</p>
              </div>
            ) : (
              <Form noValidate onSubmit={handleSubmit}>
                {/* Zone de dépôt de fichier */}
                <div className="mb-4">
                  <label className="form-label fw-bold mb-2">Document à uploader</label>
                  <div
                    className="border rounded p-4 text-center"
                    style={{
                      borderStyle: 'dashed',
                      borderColor: selectedFile ? '#198754' : '#e1b2db',
                      background: selectedFile ? 'rgba(25, 135, 84, 0.05)' : '#f9f1f8',
                      cursor: 'pointer'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {selectedFile ? (
                      <div>
                        <FileText size={48} className="text-success mb-2" />
                        <h6 className="text-success mb-1">{selectedFile.name}</h6>
                        <small className="text-muted">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF
                        </small>
                      </div>
                    ) : (
                      <div>
                        <Upload size={48} className="text-muted mb-2" />
                        <h6 className="text-muted mb-1">Cliquez pour sélectionner un fichier</h6>
                        <small className="text-muted">
                          Formats acceptés: PDF • Taille max: 10MB
                        </small>
                      </div>
                    )}
                    <input
                      name="file"
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,application/pdf"
                      style={{ display: 'none' }}
                    />
                  </div>
                  {selectedFile && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    >
                      <X size={14} className="me-1" />
                      Supprimer le fichier
                    </Button>
                  )}
                </div>

                {/* Sélection du type de document */}
                <div className="mb-3">
                  <Form.Label className="fw-bold">Type de document *</Form.Label>
                  <Form.Select
                    name="typeDocumentId"
                    value={formData.typeDocumentId}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  >
                    <option value="">Sélectionnez un type</option>
                    {typesDocument.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.intitule}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Ex: CV, Contrat, Diplôme, Attestation, etc.
                  </Form.Text>
                </div>

                {/* Informations importantes */}
                <Alert variant="info" className="mb-0">
                  <div className="d-flex">
                    <FileText size={18} className="me-2 mt-1" />
                    <div>
                      <small>
                        <strong>Note :</strong> Les documents sont stockés de manière sécurisée.
                        Assurez-vous d'avoir l'autorisation de partager ce document.
                      </small>
                    </div>
                  </div>
                </Alert>

                {/* Messages d'erreur */}
                {error && (
                  <Alert variant="danger" className="mt-3">
                    <small>{error}</small>
                  </Alert>
                )}

                {/* Footer du modal avec boutons */}
                <div className="modal-footer-custom mt-4" style={{
                  background: 'white',
                  borderTop: '1px solid #e1b2db',
                  padding: '1.2rem 0 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Button
                    variant="outline-secondary"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    <X size={16} className="me-2" />
                    Annuler
                  </Button>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || !selectedFile || !formData.typeDocumentId}
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" animation="border" className="me-2" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload size={16} className="me-2" />
                        Uploader le document
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddDocumentModal;
