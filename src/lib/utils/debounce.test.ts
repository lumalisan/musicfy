import { debounce } from './debounce';

jest.useFakeTimers();

describe('debounce', () => {
  let mockFunction: jest.Mock;

  beforeEach(() => {
    mockFunction = jest.fn();
  });

  it('should call the function after the specified delay', () => {
    const debouncedFunction = debounce(mockFunction, 500);
    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('should only call the function once if called multiple times within the delay period', () => {
    const debouncedFunction = debounce(mockFunction, 500);

    debouncedFunction();
    jest.advanceTimersByTime(200);
    debouncedFunction();
    jest.advanceTimersByTime(200);
    debouncedFunction();

    expect(mockFunction).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);

    expect(mockFunction).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the debounced function', () => {
    const debouncedFunction = debounce(mockFunction, 500);
    const arg1 = 'testArg1';
    const arg2 = 123;

    debouncedFunction(arg1, arg2);
    jest.advanceTimersByTime(500);

    expect(mockFunction).toHaveBeenCalledWith(arg1, arg2);
  });

  it('should execute different debounced functions independently', () => {
    const mockFunction2 = jest.fn();
    const debouncedFunc1 = debounce(mockFunction, 500);
    const debouncedFunc2 = debounce(mockFunction2, 500);

    debouncedFunc1();
    jest.advanceTimersByTime(250);
    debouncedFunc2();

    expect(mockFunction).not.toHaveBeenCalled();
    expect(mockFunction2).not.toHaveBeenCalled();

    jest.advanceTimersByTime(250);
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction2).not.toHaveBeenCalled();

    jest.advanceTimersByTime(250);
    expect(mockFunction).toHaveBeenCalledTimes(1);
    expect(mockFunction2).toHaveBeenCalledTimes(1);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
