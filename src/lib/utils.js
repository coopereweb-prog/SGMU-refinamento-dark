import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Retorna as propriedades (label e variant) para o Badge de status de um pedido.
 * @param {string} status O status do pedido (ex: 'pending', 'completed').
 * @returns {{label: string, variant: string}}
 */
export function getOrderStatusProps(status) {
  switch (status) {
    case 'pending':
      return {
        label: 'Pendente',
        variant: 'default',
      };
    case 'completed':
      return {
        label: 'Concluído',
        variant: 'success',
      };
    case 'cancelled':
      return {
        label: 'Cancelado',
        variant: 'destructive',
      };
    default:
      return {
        label: status || 'Indefinido',
        variant: 'secondary',
      };
  }
}

/**
 * Formata um número como moeda brasileira (BRL).
 * @param {number} value O valor numérico a ser formatado.
 * @returns {string} O valor formatado (ex.: "R$ 1.500,00").
 */
export function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}