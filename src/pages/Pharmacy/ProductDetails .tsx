import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Spinner, Row, Col, Badge } from 'react-bootstrap';
import './ProductDetails.css'; // Assuming this exists or I'll use inline/bootstrap
import { PharmacyAPI } from '../../api/Pharmacy';
import { PharmacyMedicine, CartSummary } from '../../types/Pharmacy';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ProductDetails: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<PharmacyMedicine | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);

  useEffect(() => {
    const storedProductId = localStorage.getItem('selectedProductId');
    if (storedProductId) {
      loadProduct(storedProductId);
    } else {
      toast.error("No product selected");
      navigate('/pharmacy');
    }
  }, []);

  const loadProduct = async (id: string) => {
    setLoading(true);
    try {
      // Since API expects slug for detail but we have ID, we might need to find it 
      // from the list or have an ID endpoint. 
      // For now, let's fetch all and find (not ideal but works for small catalogs)
      // OR assume the ID passed is actually usable or we have a getById.
      // Let's rely on the list for now to be safe as I don't recall adding getById
      const medicines = await PharmacyAPI.getMedicines();
      const found = medicines.find(m => m.id.toString() === id);

      if (found) {
        setProduct(found);
      } else {
        // specific fallback if getMedicineDetail assumes slug but we have ID
        // Or try calling detail with ID if backend supports it
        // setProduct(null);
        toast.error("Product not found");
      }
    } catch (error) {
      console.error("Failed to load product", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add to cart");
      return;
    }
    if (!product) return;

    const savedCart = localStorage.getItem('pharmacy_cart');
    if (savedCart) {
      const cart: CartSummary = JSON.parse(savedCart);
      if (cart.items?.some((item) => item.medicine.id === product.id)) {
        toast.info("Medicine already Exists in the cart");
        return;
      }
    }

    setAddingToCart(true);
    try {
      await PharmacyAPI.addToCart(product.id, quantity);
      toast.success("Added to cart");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;
  if (!product) return <div className="p-5 text-center">Product not found</div>;

  return (
    <Container className="py-5">
      <Button variant="outline-secondary" onClick={() => navigate(-1)} className="mb-4">
        &larr; Back
      </Button>
      <Row>
        <Col md={5} className="mb-4">
          <img
            src={product.image || '/default-medicine.png'}
            alt={product.name}
            className="img-fluid rounded shadow-sm"
            style={{ maxHeight: '400px', width: '100%', objectFit: 'contain' }}
          />
        </Col>
        <Col md={7}>
          <h2 className="mb-2">{product.name}</h2>
          <p className="text-muted mb-4">{product.manufacturer}</p>

          <div className="d-flex align-items-center mb-4">
            <h3 className="mb-0 me-3">₹{product.price}</h3>
            {product.mrp > product.price && (
              <>
                <span className="text-muted text-decoration-line-through me-2">₹{product.mrp}</span>
                <Badge bg="success">{product.discount}% OFF</Badge>
              </>
            )}
          </div>

          <div className="mb-4">
            <Button
              variant="outline-secondary"
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
            >-</Button>
            <span className="mx-3 fs-5">{quantity}</span>
            <Button
              variant="outline-secondary"
              onClick={() => setQuantity(q => q + 1)}
            >+</Button>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? <Spinner animation="border" size="sm" /> : 'Add to Cart'}
          </Button>

          <hr className="my-5" />

          {product.description && (
            <div className="mb-4">
              <h5>Description</h5>
              <p>{product.description}</p>
            </div>
          )}

          {product.composition && (
            <div className="mb-4">
              <h5>Composition</h5>
              <p>{product.composition}</p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetails;