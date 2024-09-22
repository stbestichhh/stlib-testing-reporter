import { ReportsRegistry } from './reportsRegistry';
import fs from 'fs';
import path from 'node:path';
import { isExists } from '../utils';
import { ITestReport } from '../ITestReport';

export class HtmlReporter {
  private static readonly projectPath = path.resolve('../../../');

  public static async generateReport() {
    const results = ReportsRegistry.getReports();
    const summary = this.generateSummary(results);

    const html = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Test Report</title>
            <style>
              body { font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333; }
              h1 { color: #333; text-align: center; }
              .summary { padding: 10px; margin: 20px auto; background-color: #fff; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); width: 80%; }
              .summary h2 { font-size: 24px; }
              .summary .stats { display: flex; justify-content: space-around; }
              .stat-box { text-align: center; }
              .stat-box p { margin: 5px 0; font-size: 18px; }
              .passed { color: green; }
              .failed { color: red; }
              .test-suite { margin: 20px 0; }
              .test-suite h3 { cursor: pointer; background-color: #e7e7f7; padding: 10px; margin: 0; }
              .test-suite-content { padding: 0 20px; display: none; }
              .test-case { margin: 10px 0; padding: 10px; background-color: #fff; border-radius: 5px; box-shadow: 0 0 5px rgba(0, 0, 0, 0.1); }
              .passed .test-case-header { color: green; }
              .failed .test-case-header { color: red; }
              .error { color: red; }
              .duration { font-size: 12px; color: #666; }
              .collapsible { cursor: pointer; }
            </style>
            <script>
              document.addEventListener("DOMContentLoaded", function() {
                const suites = document.querySelectorAll('.test-suite h3');
                suites.forEach((suite) => {
                  suite.addEventListener('click', () => {
                    const content = suite.nextElementSibling;
                    content.style.display = content.style.display === 'none' ? 'block' : 'none';
                  });
                });
              });
            </script>
          </head>
          <body>
            <h1>Test Report</h1>
            ${summary}
            ${this.renderResults(results)}
          </body>
          </html>
        `;

    await this.createReportFile(html);
  }

  private static async createReportFile(data: string) {
    const reportPath = path.join(
      this.projectPath,
      '.stest',
      'reports',
      `${new Date().toISOString()}.html`,
    );

    if (!(await isExists(path.dirname(reportPath)))) {
      await fs.promises.mkdir(path.dirname(reportPath), { recursive: true });
    }
    await fs.promises.writeFile(reportPath, data, 'utf-8').then(() => {
      console.info(`HTML report has been generated at ${reportPath}`);
    });
  }

  private static generateSummary(results: ITestReport[]): string {
    const totalTests = results.length;
    const passedTests = results.filter((r) => r.status === 'PASSED').length;
    const failedTests = results.filter((r) => r.status === 'FAILED').length;
    const totalTime = results.reduce((acc, result) => acc + result.duration, 0);

    return `
        <div class="summary">
          <h2>Test Summary</h2>
          <div class="stats">
            <div class="stat-box">
              <p>Total Tests</p>
              <p><strong>${totalTests}</strong></p>
            </div>
            <div class="stat-box passed">
              <p>Passed</p>
              <p><strong>${passedTests}</strong></p>
            </div>
            <div class="stat-box failed">
              <p>Failed</p>
              <p><strong>${failedTests}</strong></p>
            </div>
            <div class="stat-box">
              <p>Total Time</p>
              <p><strong>${totalTime.toFixed(2)} ms</strong></p>
            </div>
          </div>
        </div>
      `;
  }

  private static renderResults(results: ITestReport[]): string {
    const groupedResults = this.groupResultsBySuite(results);
    return groupedResults
      .map(
        ([suiteName, cases]) => `
            <div class="test-suite">
              <h3 class="collapsible">${suiteName}</h3>
              <div class="test-suite-content">
                ${cases.map(this.renderTestCase).join('')}
              </div>
            </div>
          `,
      )
      .join('');
  }

  private static renderTestCase(testCase: ITestReport): string {
    const statusClass = testCase.status === 'PASSED' ? 'passed' : 'failed';
    const error = testCase.error ? `&emsp; ${testCase.error}` : '';

    return `
          <div class="test-case ${statusClass}">
            <div class="test-case-header">
              <strong>${testCase.caseName}</strong> (${testCase.status})
            </div>
            ${error}
            <p class="duration">Duration: ${testCase.duration.toFixed(2)} ms</p>
          </div>
        `;
  }

  private static groupResultsBySuite(
    results: ITestReport[],
  ): [string, ITestReport[]][] {
    return Object.entries(
      results.reduce(
        (acc, result) => {
          (acc[result.suiteName] = acc[result.suiteName] || []).push(result);
          return acc;
        },
        {} as { [suiteName: string]: ITestReport[] },
      ),
    );
  }
}
