export interface ITestReport {
  suiteName: string;
  caseName: string;
  status: 'PASSED' | 'FAILED';
  duration: number;
  error?: string;
}
