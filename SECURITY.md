# Security Policy

Good Circles takes the security of our community marketplace — and the personal and financial data entrusted to it — seriously. This document explains how to report vulnerabilities and what to expect.

## Reporting a vulnerability

**Email:** security@goodcircles.org

Please include:
- A description of the issue and its potential impact.
- Steps to reproduce (proof-of-concept, affected URL/endpoint, request/response if relevant).
- Any accounts, IPs, or timestamps you used, so we can correlate logs.

Please **do not** open a public GitHub issue for security reports.

## Our commitment

- **Acknowledgement:** within 3 business days.
- **Triage & severity assessment:** within 7 business days.
- **Remediation targets (from triage):** Critical ≤ 7 days · High ≤ 30 days · Medium ≤ 90 days · Low as scheduled.
- We will keep you informed of progress and let you know when the issue is resolved.

## Safe harbor

We will not pursue or support legal action against researchers who, in good faith:
- Make a genuine effort to avoid privacy violations, data destruction, and service disruption.
- Only interact with accounts they own or have explicit permission to test.
- Do **not** exfiltrate more data than necessary to demonstrate the issue, and delete any retrieved data promptly.
- Give us reasonable time to remediate before public disclosure.

## In scope

- The Good Circles marketplace application and API (Railway-hosted backend).
- The marketing site (goodcircles.org).

## Out of scope / please avoid

- Denial-of-service (DoS/DDoS), volumetric or resource-exhaustion testing.
- Social engineering, phishing, or physical attacks against Good Circles staff or infrastructure.
- Automated scanning that generates high traffic without prior coordination.
- Reports from automated tools without a demonstrated, exploitable impact.

## Handling of payment & sensitive data

Good Circles is designed for **PCI DSS SAQ-A**: cardholder data (PAN/CVV/expiry) is entered directly with our payment processor (Stripe hosted Checkout / Elements) and **never** transits or is stored on our servers. Tax identifiers (W-9/TIN), when collected, are encrypted at rest. If you believe you have found a way for card data to reach our servers, treat it as **Critical** and report immediately.

## Recognition

We're happy to credit researchers who report valid issues (with your permission) once a fix is deployed.
