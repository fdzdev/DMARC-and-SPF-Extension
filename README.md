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
{
  "manifest_version": 3,
  "name": "DMARC and SPF Checker",
  "version": "1.0",
  "permissions": ["activeTab", "dns", "storage"],
  "host_permissions": ["https://dns.google/*"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon16.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
    }
  }
}
```
## Popup Interface

### Design (`popup.html`)

The popup UI is styled for clarity and usability. It includes:

- **Current Tab Records:** Displays DMARC and SPF data for the active tab.
- **History Tab:** Lists previously analyzed domains.

#### Features

- **Tabs:** Switch between "Current" and "History."
- **Styled Alerts:** Status indicators (success, warning, error).
- **Dynamic Content:** A loading spinner during DNS queries.

---

### Interactivity (`popup.js`)

Handles:

- **Communication with `background.js`:** Sends requests to retrieve DNS queries.
- **Dynamic Rendering:** Updates the UI with fetched results.
- **History Management:** Supports saving, retrieving, and clearing history.

#### Example Function:
```javascript
function fetchAndRenderResults(domain) {
  chrome.runtime.sendMessage({ action: "fetchDNS", domain }, (response) => {
    if (response.error) {
      displayError(response.error);
    } else {
      displayResults(response.records);
    }
  });
}
```

## Background Script (`background.js`)

Handles DNS queries and backend logic:

- **Google DNS API:** Fetches DMARC/SPF `TXT` records for the domain.
- **Message Listener:** Processes requests from the popup script.
- **Error Notifications:** Alerts users to missing or malformed DNS records.

### Example DNS Query
```javascript
function fetchDNSRecords(domain) {
  fetch(`https://dns.google/resolve?name=${domain}&type=TXT`)
    .then(response => response.json())
    .then(data => parseRecords(data));
}
```