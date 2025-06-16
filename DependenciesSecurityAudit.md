# Frontend Dependencies Security Audit for Genesis Project

**Date:** June 14, 2025

This document outlines the security audit conducted on the frontend dependencies used in the Genesis Project.

## Dependencies Audit

Below is a list of the dependencies and our findings regarding their compliance with security standards:

- **@mobily/ts-belt: 3.13.1** - Based on our current analysis, this utility library does not present any known high-severity vulnerabilities that would violate our security standards.
- **@tailwindcss/vite: 4.1.4** - Our review of the release notes and available security information indicates that this Vite plugin for Tailwind CSS is currently compliant with our security standards. We will continue to monitor Tailwind CSS for any future security announcements.
- **@tanstack/react-query: 5.74.4** - While a cross-site scripting (XSS) vulnerability (CVE-2024-24558) was identified in older versions of a related package (`@tanstack/react-query-next-experimental`), our current version (`5.74.4`) is more recent. We believe it meets our security standards at this time, but we will continue to monitor for any emerging issues and consider upgrading as needed.
- **@tanstack/react-query-devtools: 5.74.6** - No direct vulnerabilities have been found for this package in Snyk’s vulnerability database. This does not include vulnerabilities belonging to this package’s dependencies.Based on our current understanding and mitigation strategies, we consider this package to be within our acceptable security standards for now. We will continue to monitor and evaluate if further action is required.
- **@types/lodash: 4.17.16** - This package provides TypeScript definitions for Lodash. As such, it doesn't introduce functional code that would directly pose a security risk. The security of the actual Lodash library is assessed separately.
- **lodash: 4.17.21** - While Lodash has had a history of reported vulnerabilities, version 4.17.21 addresses several of the more critical ones. We have evaluated the remaining publicly known vulnerabilities (such as potential Command Injection and ReDoS) and, based on our current usage and application context, we believe this version meets our security standards. However, given its history, we will explore safer alternatives.
- **neverthrow: 8.2.0** - We investigated a potential Regular Expression Denial of Service (ReDoS) vulnerability in the `validator` package, which `neverthrow` might use. Our analysis suggests that our current usage of `neverthrow` does not expose us to this specific vulnerability in a way that would violate our security standards. We will remain vigilant for any further developments.
- **react: 19.0.0** - React is a widely used and actively maintained library with a strong focus on security. Our analysis confirms that version 19.0.0 currently meets our security standards.
- **react-dom: 19.0.0** - Similar to React, `react-dom` is actively maintained with security as a priority. We have determined that version 19.0.0 aligns with our security standards.
- **react-router-dom: 7.6.2** - Our review of this routing library indicates that version 7.6.2 meets our security standards.
- **react-toastify: 11.0.5** - We have assessed `react-toastify` and found that version 11.0.5 is currently compliant with our security standards.
- **tailwind: 4.0.0** - We need to clarify if this standalone Tailwind CSS framework is intentionally used alongside `@tailwindcss/vite`. If our intention is to use Tailwind CSS through the Vite plugin, this dependency might be redundant and could potentially introduce unnecessary security risks if it's not actively maintained. If it's redundant, we should remove it to ensure we are adhering to our security standards by minimizing unnecessary dependencies.
- **zod: 3.25.42** - Zod is a validation library, and our assessment indicates that version 3.25.42 meets our security standards for data validation.

## Zero-Day Vulnerabilities

It's important to acknowledge that while we have assessed all dependencies against known security standards, **it's impossible to provide an absolute guarantee that any software package is completely free of zero-day vulnerabilities.** A zero-day vulnerability, by its nature, is unknown and therefore cannot be checked against proactively.

Our strategy to mitigate the risk of zero-day vulnerabilities includes:

- **Maintaining Up-to-Date Dependencies:** We are committed to regularly updating all our dependencies to their latest stable versions to benefit from the most recent security patches as soon as they become available.
- **Continuous Security Monitoring:** We will continuously monitor security advisories and announcements for all the libraries we use to stay informed of any newly discovered vulnerabilities, including potential zero-day threats as they are disclosed. This monitoring will include using automated vulnerability scanning tools, subscribing to mailing lists and RSS feeds from library developers and security groups, and regularly reviewing vulnerability databases such as the NVD (National Vulnerability Database).
- **Rigorous Code Reviews:** Our development process includes thorough code reviews to help identify potential security weaknesses in our application logic that could be targeted by vulnerabilities in our dependencies, including unforeseen zero-day exploits.
- **Utilizing Security Scanning Tools:** We will integrate security scanning tools into our development pipeline to automate the detection of known vulnerabilities. This will provide an additional layer of defense against both known and potentially newly discovered vulnerabilities.
- **Adhering to the Principle of Least Privilege:** Our application is designed with the principle of least privilege in mind to limit the potential impact of any successful exploit, including those leveraging zero-day vulnerabilities.
- **Employing a Web Application Firewall (WAF):** We utilize a WAF to provide a perimeter defense against common web exploits, which can help mitigate the impact of some zero-day vulnerabilities targeting frontend components.

## Suggested Package Replacement: lodash

Based on our audit, **`lodash` (version 4.17.21)** warrants consideration for replacement due to its history of reported security vulnerabilities. While the current version addresses several critical issues (Prototype Pollution, Code Injection, ReDoS), the recurring nature of past vulnerabilities suggests a potentially elevated risk profile.

Therefore, I propose evaluating a replacement for `lodash` with **`@mobily/ts-belt` (version 3.13.1)**.

### Rationale for Choosing `@mobily/ts-belt`:

- **TypeScript-Centric:** `@mobily/ts-belt` is built for TypeScript, offering strong type safety which can prevent certain classes of vulnerabilities.
- **Modular and Lean:** `@mobily/ts-belt` provides a focused set of utility functions, which can lead to a smaller overall bundle size. A smaller codebase generally implies a reduced attack surface.
- **Fewer Recent Vulnerabilities:** Our initial security analysis indicates that `@mobily/ts-belt` version 3.13.1 has not had any significant recent security vulnerabilities reported.
- **Active Development:** The library appears to be under active development, suggesting that any potential issues would likely be addressed in a timely manner.

### Steps Taken to Determine the "Level of Security" of `@mobily/ts-belt`:

1.  **Vulnerability Research:** I conducted searches for known security vulnerabilities associated with `@mobily/ts-belt`. This included checking npm security reports, dedicated vulnerability databases, and the library's issue tracker for any disclosed security flaws. The findings for the current version were reassuring.
2.  **Scope Assessment:** I reviewed the scope of `@mobily/ts-belt`. Its more focused nature compared to the broad utility set of `lodash` suggests a potentially lower likelihood of complex security issues arising.
3.  **Maintenance Review:** I examined the library's repository (available on GitHub) to assess the level of maintenance. Regular commits, active issue resolution, and recent releases indicate a commitment to the project and a likely responsiveness to security concerns.
4.  **Type Safety Evaluation:** The fact that `@mobily/ts-belt` is written in TypeScript and provides strong typing is a significant security advantage. Type safety helps prevent common programming errors that can sometimes be exploited.

### Migration Steps:

1.  **Install `@mobily/ts-belt`:**

    ```bash
    npm install @mobily/ts-belt
    # or
    yarn add @mobily/ts-belt
    ```

2.  **Analyze `lodash` Usage:** I will need to carefully go through our codebase to identify every instance where a `lodash` function is used.

3.  **Update Imports:** The import statements will need to be changed from importing `lodash` as a whole or individual functions from `lodash` to importing the corresponding functions from `@mobily/ts-belt`. For example, `import { map } from '@mobily/ts-belt';`.

4.  **Code Refactoring:** For each `lodash` function, I will need to find its equivalent in `@mobily/ts-belt`. It's important to note that function names and parameters might differ, requiring careful adjustments to the code. If a specific `lodash` function isn't available in `@mobily/ts-belt`, we will need to consider alternative libraries or implement the functionality ourselves using standard JavaScript/TypeScript.

5.  **Comprehensive Testing:** After the refactoring is complete, thorough testing is crucial to ensure that all parts of the application that previously relied on `lodash` are still functioning correctly with `@mobily/ts-belt`.

6.  **Remove `lodash`:** Once we are confident in the stability of the migrated code, the `lodash` dependency can be removed:
    ```bash
    npm uninstall lodash
    # or
    yarn remove lodash
    ```

By considering the replacement of `lodash` with `@mobily/ts-belt`, we aim to enhance the security posture of the Genesis Project by reducing our reliance on a library with a notable history of vulnerabilities and leveraging the benefits of TypeScript's type safety and `@mobily/ts-belt`'s focused design. This transition will require careful planning and execution, including thorough testing to maintain the stability and functionality of our application.

Further investigation into the vulnerabilities reported for `@tanstack/react-query-devtools` and a decision regarding the `tailwind` dependency are also recommended next steps in our ongoing security review process.
