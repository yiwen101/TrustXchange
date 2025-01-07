// src/components/p2p/filters.ts

import { P2pBorrowingRequest, P2pLendingRequest } from "../../api/backend/types/p2pTypes";

export type RequestType = P2pBorrowingRequest | P2pLendingRequest;

// Filter function type
export type FilterFunction = (row: RequestType) => boolean;


// Filter Configuration type
export interface FilterConfig<T> {
  value: T;
  condition: string;
}

// Filter function
export const createFilter = <T>(
  filterConfig: FilterConfig<T>,
  getter: (row: RequestType) => T,
  comparisonFn: (getterValue: T, filterValue: T, condition: string) => boolean
): FilterFunction => {
    return (row: RequestType) => {
      const rowValue = getter(row);
      if(filterConfig.value == null || filterConfig.condition === "any") {
          return true;
      }
        return comparisonFn(rowValue, filterConfig.value, filterConfig.condition);

    }
};

// Generic Filter functions
export const numberCompare = (
    rowValue: number,
    filterValue: number,
    condition: string
): boolean => {
    if(condition === "greater")
       return rowValue > filterValue;
     if(condition === "less")
         return rowValue < filterValue;
     if(condition === "equal")
         return rowValue === filterValue
    return false
};

export const stringCompare = (
    rowValue: string,
    filterValue: string,
    condition: string
): boolean => {
    return  rowValue.toLowerCase().includes(filterValue.toLowerCase());
}

export const boolCompare = (
    rowValue: boolean,
    filterValue: boolean,
    condition: string
): boolean => {
    return rowValue === filterValue;
}