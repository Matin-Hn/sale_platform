import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { getProducts, getCategories } from '../api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('Starting fetchData...');
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Sending request to /api/products/ with params:', { search: searchTerm, category: selectedCategory });
        const productsRes = await getProducts({ search: searchTerm, category: selectedCategory });
        console.log('Products Response:', productsRes);
        const categoriesRes = await getCategories();
        console.log('Categories Response:', categoriesRes);
        setProducts(productsRes.data.results || productsRes.data);
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError(`خطا در بارگذاری داده‌ها: ${err.message}`);
        if (err.response) {
          console.error('Response Error Details:', err.response.data, err.response.status);
        } else if (err.request) {
          console.error('No Response Received:', err.request);
        } else {
          console.error('Error Setup:', err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchTerm, selectedCategory]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">محصولات فروشگاه</h1>

      {/* فیلتر و جستجو */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="جستجوی محصولات..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full md:w-1/2 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          className="w-full md:w-1/4 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">همه دسته‌بندی‌ها</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* نمایش محصولات */}
      {loading ? (
        <p className="text-center">در حال بارگذاری...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-center">محصولی یافت نشد</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;