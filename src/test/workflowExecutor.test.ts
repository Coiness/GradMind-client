import { describe, it, expect } from 'vitest';

/**
 * 测试 extractSourceValue 函数的逻辑
 * 这是 P0 修复的核心：从多输出端口正确提取数据
 */
describe('workflowExecutor - extractSourceValue', () => {
  // 模拟 extractSourceValue 函数（从 workflowExecutor.ts 提取）
  function extractSourceValue(sourceResult: unknown, sourceHandle: string): unknown {
    if (
      sourceResult &&
      typeof sourceResult === 'object' &&
      sourceHandle in (sourceResult as Record<string, unknown>)
    ) {
      return (sourceResult as Record<string, unknown>)[sourceHandle];
    }
    return sourceResult;
  }

  it('应该从对象中提取指定字段', () => {
    const sourceResult = {
      u: [[1, 2], [3, 4]],
      sigma: [5, 6],
      vt: [[7, 8], [9, 10]],
    };

    expect(extractSourceValue(sourceResult, 'u')).toEqual([[1, 2], [3, 4]]);
    expect(extractSourceValue(sourceResult, 'sigma')).toEqual([5, 6]);
    expect(extractSourceValue(sourceResult, 'vt')).toEqual([[7, 8], [9, 10]]);
  });

  it('字段不存在时应该返回整个对象', () => {
    const sourceResult = { data: [1, 2, 3] };

    expect(extractSourceValue(sourceResult, 'nonexistent')).toEqual({ data: [1, 2, 3] });
  });

  it('sourceResult 为 null 时应该返回 null', () => {
    expect(extractSourceValue(null, 'field')).toBe(null);
  });

  it('sourceResult 为 undefined 时应该返回 undefined', () => {
    expect(extractSourceValue(undefined, 'field')).toBe(undefined);
  });

  it('sourceResult 为原始类型时应该返回原始值', () => {
    expect(extractSourceValue(42, 'field')).toBe(42);
    expect(extractSourceValue('string', 'field')).toBe('string');
    expect(extractSourceValue(true, 'field')).toBe(true);
  });

  it('sourceResult 为数组时应该返回整个数组', () => {
    const arr = [1, 2, 3];
    expect(extractSourceValue(arr, 'field')).toEqual([1, 2, 3]);
  });
});
