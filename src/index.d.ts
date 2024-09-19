export class HtmlReporter {
  public static generateReport(): Promise<void>;
}

export interface ITestReport {
  suiteName: string;
  caseName: string;
  status: 'PASSED' | 'FAILED';
  duration: number;
  error?: string;
}

export class Report {
  public read(): ITestReport;
}

export class ReportBuilder {
  constructor(suiteName: string, caseName: string);
  public getReport(): Report;
  public status(testStatus: 'PASSED' | 'FAILED'): ReportBuilder;
  public duration(time: number): ReportBuilder;
  public thrown(error: string): ReportBuilder;
}

export class ReportsRegistry {
  public static addReport(report: ITestReport): void;
  public static getReports(): void;
  public static clearRegistry(): void;
}
