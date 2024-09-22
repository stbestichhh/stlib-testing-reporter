import { ITestReport } from '../ITestReport';

export class ReportsRegistry {
  private static testReports: ITestReport[] = [];

  public static addReport(report: ITestReport) {
    this.testReports.push(report);
  }

  public static getReports() {
    return this.testReports;
  }

  public static clearRegistry() {
    this.testReports = [];
  }
}
