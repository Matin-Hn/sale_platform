import React, { useEffect, useState } from "react";
import axios from "axios";

export default function ProductList({ typeId }) {
  const [products, setProducts] = useState([]);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // گرفتن نوع محصول و فیلدها
        const typeRes = await axios.get(`/api/product-types/${typeId}/`);
        setFields(typeRes.data.fields);

        // گرفتن محصولات
        const productsRes = await axios.get(`/api/products/?type=${typeId}`);
        setProducts(productsRes.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    }
    fetchData();
  }, [typeId]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <table className="table-auto border-collapse border border-gray-400 w-full">
        <thead>
          <tr>
            {fields.map((field, idx) => (
              <th key={idx} className="border border-gray-400 px-4 py-2">
                {field.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map((prod, idx) => (
            <tr key={idx}>
              {fields.map((field, fIdx) => (
                <td key={fIdx} className="border border-gray-400 px-4 py-2">
                  {prod.data[field.name]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
