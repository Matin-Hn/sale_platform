import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <img
        src={product.image_url || 'https://via.placeholder.com/150'}
        alt={product.name}
        className="w-full h-48 object-cover rounded-md mb-4"
      />
      <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
      <p className="text-gray-600">{product.description.slice(0, 100)}...</p>
      <p className="text-lg font-bold text-green-600 mt-2">{product.price} تومان</p>
      <p className="text-sm text-gray-500">
        موجودی: {product.stock} | انقضا: {product.expiration_date || 'نامشخص'}
      </p>
      <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition">
        افزودن به سبد خرید
      </button>
    </div>
  );
};

export default ProductCard;