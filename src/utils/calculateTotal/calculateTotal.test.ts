import { describe, it, expect } from 'vitest';
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
    it('should return 0 for empty string', () => {
        expect(calculateTotal('')).toBe(0);
    });

    it('should return 0 for whitespace-only string', () => {
        expect(calculateTotal('   ')).toBe(0);
        expect(calculateTotal('\n\n')).toBe(0);
        expect(calculateTotal('\t\t')).toBe(0);
    });

    it('should calculate total for comma-separated values', () => {
        expect(calculateTotal('100,200,300')).toBe(600);
        expect(calculateTotal('100, 200, 300')).toBe(600);
        expect(calculateTotal('10.5,20.5,30')).toBe(61);
    });

    it('should calculate total for newline-separated values', () => {
        expect(calculateTotal('100\n200\n300')).toBe(600);
        expect(calculateTotal('100\n200\n300\n')).toBe(600);
        expect(calculateTotal('10.5\n20.5\n30')).toBe(61);
    });

    it('should calculate total for mixed comma and newline-separated values', () => {
        expect(calculateTotal('100,200\n300')).toBe(600);
        expect(calculateTotal('100\n200,300')).toBe(600);
        expect(calculateTotal('100,200\n300,400')).toBe(1000);
        expect(calculateTotal('200, 200\n100')).toBe(500);
    });

    it('should handle multiple consecutive separators', () => {
        expect(calculateTotal('100,,200')).toBe(300);
        expect(calculateTotal('100\n\n200')).toBe(300);
        expect(calculateTotal('100,\n,200')).toBe(300);
    });

    it('should ignore invalid numbers', () => {
        expect(calculateTotal('100,abc,200')).toBe(300);
        expect(calculateTotal('100\nabc\n200')).toBe(300);
        expect(calculateTotal('abc,def,ghi')).toBe(0);
        expect(calculateTotal('100,NaN,200')).toBe(300);
    });

    it('should handle decimal numbers', () => {
        expect(calculateTotal('10.5,20.25,30.75')).toBe(61.5);
        expect(calculateTotal('0.1\n0.2\n0.3')).toBeCloseTo(0.6, 10);
    });

    it('should handle negative numbers', () => {
        expect(calculateTotal('-100,200,300')).toBe(400);
        expect(calculateTotal('100,-50,200')).toBe(250);
        expect(calculateTotal('-10\n-20\n-30')).toBe(-60);
    });

    it('should handle zero values', () => {
        expect(calculateTotal('0,100,200')).toBe(300);
        expect(calculateTotal('100,0,200')).toBe(300);
        expect(calculateTotal('0,0,0')).toBe(0);
    });

    it('should handle single values', () => {
        expect(calculateTotal('100')).toBe(100);
        expect(calculateTotal('0')).toBe(0);
        expect(calculateTotal('-50')).toBe(-50);
        expect(calculateTotal('10.5')).toBe(10.5);
    });

    it('should handle large numbers', () => {
        expect(calculateTotal('1000000,2000000,3000000')).toBe(6000000);
        expect(calculateTotal('1e6,2e6,3e6')).toBe(6000000);
    });

    it('should handle extra whitespace around numbers', () => {
        expect(calculateTotal('  100  ,  200  ,  300  ')).toBe(600);
        expect(calculateTotal(' 100 \n 200 \n 300 ')).toBe(600);
        expect(calculateTotal('\t100\t,\t200\t,\t300\t')).toBe(600);
    });

    it('should handle complex real-world scenarios', () => {
        const complexInput = `
            100.5, 200.25
            300
            150.75, 50
        `;
        expect(calculateTotal(complexInput)).toBe(801.5);
    });

    it('should handle edge case with only separators', () => {
        expect(calculateTotal(',')).toBe(0);
        expect(calculateTotal('\n')).toBe(0);
        expect(calculateTotal(',\n,\n,')).toBe(0);
    });
});
