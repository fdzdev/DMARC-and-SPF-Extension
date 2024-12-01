# DMARC and SPF Checker - Chrome Extension

## Overview

The **DMARC and SPF Checker** is a Chrome extension designed to evaluate DMARC and SPF policies for websites you visit. By leveraging DNS queries and Google's public DNS service, it retrieves and displays essential email authentication records, ensuring enhanced email security visibility.

This extension consists of several key components, including background processing, popup UI, and storage functionality to display current results and maintain a history of checks.

---

## Features

1. **Active Tab Analysis:** Extracts DNS records related to DMARC and SPF for the current website.
2. **History Tracking:** Stores a history of analyzed domains and their respective records.
3. **Interactive UI:** Provides a clean interface with tabs for viewing current results and historical data.
4. **Error Handling:** Displays warnings and errors for missing or malformed records.
5. **Customizable Storage:** Saves results locally for user reference, with an option to clear history.

---

## Technical Breakdown

### Manifest File (`manifest.json`)

The manifest defines the extension's permissions, actions, and background tasks. Key highlights:
- **`manifest_version: 3`:** Adheres to the latest extension standards.
- **Permissions:** Includes `activeTab` for the current tab, `dns` for DNS queries, and `storage` for local history storage.
- **Background Service Worker:** Runs `background.js` to perform DNS queries.
- **Content Scripts:** Injects `content.js` for potential future interaction with web pages.

Key snippet:
```json
"background": {
    "service_worker": "background.js"
},
"permissions": ["activeTab", "dns", "storage"],
"host_permissions": ["https://dns.google/*"]
```