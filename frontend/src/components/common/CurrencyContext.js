import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const CurrencyContext = createContext(null);

const DEFAULT_CURRENCY = 'VND';
const SUPPORTED_CURRENCIES = ['VND', 'USD'];
const FALLBACK_USD_RATE = 1 / 25000;

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    try {
      const saved = localStorage.getItem('app_currency');
      if (saved && SUPPORTED_CURRENCIES.includes(saved)) {
        return saved;
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_CURRENCY;
  });

  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRate = useCallback(async (targetCurrency) => {
    if (targetCurrency === 'VND') {
      setRate(1);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ from: 'VND', to: targetCurrency });
      const res = await fetch(`/api/exchange-rate?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Không lấy được tỉ giá từ máy chủ.');
      }
      const data = await res.json();
      if (!data.rate || typeof data.rate !== 'number') {
        throw new Error('Tỉ giá không hợp lệ.');
      }
      setRate(data.rate);
    } catch (err) {
      console.error('Lỗi tải tỉ giá:', err);
      setError(err.message || 'Không thể tải tỉ giá.');
      if (targetCurrency === 'USD') {
        setRate(FALLBACK_USD_RATE);
      } else {
        setRate(1);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('app_currency', currency);
    } catch (e) {
      // ignore
    }
  }, [currency]);

  useEffect(() => {
    fetchRate(currency);
  }, [currency, fetchRate]);

  const changeCurrency = (nextCurrency) => {
    if (!SUPPORTED_CURRENCIES.includes(nextCurrency)) return;
    setCurrency(nextCurrency);
  };

  const formatPrice = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    const numeric = Number(value) || 0;
    const converted = currency === 'VND' ? numeric : numeric * rate;

    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(converted);
    }

    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(converted);
  };

  const value = {
    currency,
    rate,
    loading,
    error,
    changeCurrency,
    formatPrice,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: DEFAULT_CURRENCY,
      rate: 1,
      loading: false,
      error: '',
      changeCurrency: () => {},
      formatPrice: (value) => {
        if (value === null || value === undefined || isNaN(value)) {
          return '';
        }
        const numeric = Number(value) || 0;
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(numeric);
      },
    };
  }
  return ctx;
};
