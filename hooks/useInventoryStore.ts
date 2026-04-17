import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';
import { marketplaceService, MarketplaceResponse } from '../services/marketplaceService';

export function useInventoryStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [pageSize] = useState(20);

  const fetchProducts = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response: MarketplaceResponse = await marketplaceService.search({
        q: searchTerm || undefined,
        category: activeCategory === 'All' ? undefined : activeCategory,
        page,
        limit: pageSize,
      });
      setProducts(response.listings);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.totalPages);
      setTotalProducts(response.pagination.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, activeCategory, pageSize]);

  // Re-fetch when search or category changes (reset to page 1)
  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(1);
  }, [searchTerm, activeCategory]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
    // Scroll to top of product grid
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const addProduct = (newProduct: Product) => {
    setProducts(prev => [newProduct, ...prev]);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  return {
    products,
    searchTerm,
    setSearchTerm,
    activeCategory,
    setActiveCategory,
    updateProduct,
    addProduct,
    deleteProduct,
    isLoading,
    // Pagination
    currentPage,
    totalPages,
    totalProducts,
    pageSize,
    goToPage,
    nextPage,
    prevPage,
  };
}
