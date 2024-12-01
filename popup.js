async function checkDNSRecords(domain) {
    try {
        // Remove 'www.' if present to get the root domain
        const rootDomain = domain.replace(/^www\./, '');

        // Get DMARC record
        const dmarcResponse = await fetch(`https://dns.google/resolve?name=_dmarc.${rootDomain}&type=TXT`);
        const dmarcData = await dmarcResponse.json();
        const dmarcRecord = dmarcData.Answer ?
            dmarcData.Answer[0].data.replace(/['"]/g, '') : null;

        // Get SPF record
        const spfResponse = await fetch(`https://dns.google/resolve?name=${rootDomain}&type=TXT`);
        const spfData = await spfResponse.json();
        const spfRecord = spfData.Answer ?
            spfData.Answer.find(record => record.data.toLowerCase().includes('v=spf1'))?.data.replace(/['"]/g, '') : null;

        return {
            dmarc: dmarcRecord,
            spf: spfRecord
        };
    } catch (error) {
        throw new Error('Failed to fetch DNS records');
    }
}

function analyzeDMARCPolicy(dmarcRecord) {
    if (!dmarcRecord) {
        return {
            status: 'error',
            message: 'No DMARC record found',
            details: 'Domain is vulnerable to email spoofing'
        };
    }

    // Check if record has a p= tag
    if (!dmarcRecord.includes('p=')) {
        return {
            status: 'error',
            message: 'DMARC record missing required p= tag',
            details: 'Invalid DMARC configuration'
        };
    }

    // Extract policy
    const policyMatch = dmarcRecord.match(/p=([^;\s]+)/);
    const policy = policyMatch ? policyMatch[1].toLowerCase() : null;

    if (policy === 'none') {
        return {
            status: 'warning',
            message: dmarcRecord,
            details: 'DMARC policy set to none (monitoring only) - emails can still be spoofed'
        };
    } else if (policy === 'quarantine') {
        return {
            status: 'warning',
            message: dmarcRecord,
            details: 'Suspicious emails are quarantined but not rejected'
        };
    } else if (policy === 'reject') {
        return {
            status: 'success',
            message: dmarcRecord,
            details: 'Strong DMARC protection enabled'
        };
    }

    return {
        status: 'error',
        message: dmarcRecord,
        details: 'Invalid DMARC policy value'
    };
}

function analyzeSPFPolicy(spfRecord) {
    if (!spfRecord) {
        return {
            status: 'error',
            message: 'No SPF record found',
            details: 'Domain is vulnerable to email spoofing'
        };
    }

    // Check if it's a valid SPF record starting with v=spf1
    if (!spfRecord.toLowerCase().startsWith('v=spf1')) {
        return {
            status: 'error',
            message: spfRecord,
            details: 'Invalid SPF record format'
        };
    }

    // Check for ~all or -all
    if (spfRecord.includes('-all')) {
        return {
            status: 'success',
            message: spfRecord,
            details: 'Strict SPF policy enforced'
        };
    } else if (spfRecord.includes('~all')) {
        return {
            status: 'warning',
            message: spfRecord,
            details: 'Soft fail policy - some emails may be marked as suspicious'
        };
    } else if (spfRecord.includes('+all')) {
        return {
            status: 'error',
            message: spfRecord,
            details: 'Dangerous configuration - allows all senders'
        };
    }

    return {
        status: 'warning',
        message: spfRecord,
        details: 'No explicit policy specified'
    };
}

function generateRecordHTML(label, analysis) {
    const icons = {
        'error': '⚠️',
        'warning': '⚡',
        'success': '✅'
    };

    return `
        <div class="record-container ${analysis.status}">
            <div class="record-label">
                <span class="status-indicator"></span>
                ${label} ${icons[analysis.status]}
            </div>
            <div class="record-value">
                ${analysis.message}
            </div>
            <div class="record-details">
                ${analysis.details}
            </div>
        </div>
    `;
}

function analyzeSPFPolicy(spfRecord) {
    if (!spfRecord) {
        return {
            status: 'error',
            message: 'No SPF record found',
            details: 'Domain is vulnerable to email spoofing'
        };
    }

    // Check if it's a valid SPF record starting with v=spf1
    if (!spfRecord.toLowerCase().startsWith('v=spf1')) {
        return {
            status: 'error',
            message: spfRecord,
            details: 'Invalid SPF record format'
        };
    }

    // Check for ~all or -all
    if (spfRecord.includes('-all')) {
        return {
            status: 'success',
            message: spfRecord,
            details: 'Strict SPF policy enforced'
        };
    } else if (spfRecord.includes('~all')) {
        return {
            status: 'warning',
            message: spfRecord,
            details: 'Soft fail policy - some emails may be marked as suspicious'
        };
    } else if (spfRecord.includes('+all')) {
        return {
            status: 'error',
            message: spfRecord,
            details: 'Dangerous configuration - allows all senders'
        };
    }

    return {
        status: 'warning',
        message: spfRecord,
        details: 'No explicit policy specified'
    };
}

function generateRecordHTML(label, analysis) {
    return `
        <div class="record-container ${analysis.status}">
            <div class="record-label">
                <span class="status-indicator"></span>
                ${label}
            </div>
            <div class="record-value">
                ${analysis.message}
            </div>
        </div>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        const domain = url.hostname.replace(/^www\./, '');

        checkDNSRecords(domain).then(async (result) => {
            const resultsDiv = document.getElementById("results");

            // Analyze policies
            const dmarcAnalysis = analyzeDMARCPolicy(result.dmarc);
            const spfAnalysis = analyzeSPFPolicy(result.spf);

            // Save to history
            await saveToHistory(domain, result);

            // Update UI
            resultsDiv.innerHTML = `
                <div class="domain-name">
                    ${domain}
                </div>
                ${generateRecordHTML('DMARC Record', dmarcAnalysis)}
                ${generateRecordHTML('SPF Record', spfAnalysis)}
            `;
        }).catch(error => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = `
                <div class="record-container error">
                    <div class="record-value">
                        Error checking DNS records: ${error.message}
                    </div>
                </div>
            `;
        });
    });
});
// ... existing code ...

// Remove the duplicate DOMContentLoaded event listener and keep only this updated version
document.addEventListener("DOMContentLoaded", () => {
    // Tab switching logic
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');

            if (tab.dataset.tab === 'history') {
                loadHistory();
            }
        });
    });

    // Clear history button
    document.querySelector('.clear-history').addEventListener('click', async () => {
        await chrome.storage.local.set({ dnsHistory: [] });
        loadHistory();
    });

    // Check current domain
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const domain = new URL(tabs[0].url).hostname;

        checkDNSRecords(domain).then(async (result) => {
            const resultsDiv = document.getElementById("results");

            // Analyze policies
            const dmarcAnalysis = analyzeDMARCPolicy(result.dmarc);
            const spfAnalysis = analyzeSPFPolicy(result.spf);

            // Save to history
            await saveToHistory(domain, result);

            // Update UI using the generateRecordHTML function
            resultsDiv.innerHTML = `
                <div class="domain-name">
                    ${domain}
                </div>
                ${generateRecordHTML('DMARC Record', dmarcAnalysis)}
                ${generateRecordHTML('SPF Record', spfAnalysis)}
            `;
        }).catch(error => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = `
                <div class="record-container error">
                    <div class="record-value">
                        Error checking DNS records: ${error.message}
                    </div>
                </div>
            `;
        });
    });
});

async function saveToHistory(domain, records) {
    // Get existing history, initialize empty array if undefined
    const result = await chrome.storage.local.get('dnsHistory');
    const history = result.dnsHistory || [];

    const newEntry = {
        domain,
        records,
        timestamp: new Date().toISOString()
    };

    // Add to beginning of array and limit to 50 entries
    const updatedHistory = [newEntry, ...history].slice(0, 50);
    await chrome.storage.local.set({ dnsHistory: updatedHistory });
}

async function loadHistory() {
    const result = await chrome.storage.local.get('dnsHistory');
    const historyResults = document.getElementById('history-results');

    const history = result.dnsHistory || [];

    if (history.length === 0) {
        historyResults.innerHTML = '<div class="no-history">No history available</div>';
        return;
    }

    historyResults.innerHTML = history.map(entry => {
        const dmarcAnalysis = analyzeDMARCPolicy(entry.records.dmarc);
        const spfAnalysis = analyzeSPFPolicy(entry.records.spf);

        return `
            <div class="history-item">
                <div class="domain-name">${entry.domain}</div>
                ${generateRecordHTML('DMARC Record', dmarcAnalysis)}
                ${generateRecordHTML('SPF Record', spfAnalysis)}
                <div class="history-date">
                    ${new Date(entry.timestamp).toLocaleString()}
                </div>
            </div>
        `;
    }).join('');
}
document.addEventListener("DOMContentLoaded", () => {
    // Tab switching logic
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');

            if (tab.dataset.tab === 'history') {
                loadHistory();
            }
        });
    });

    // Clear history button
    document.querySelector('.clear-history').addEventListener('click', async () => {
        await chrome.storage.local.set({ dnsHistory: [] });
        loadHistory();
    });

    // Check current domain
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const domain = new URL(tabs[0].url).hostname;

        checkDNSRecords(domain).then(async (result) => {
            const resultsDiv = document.getElementById("results");

            // Save to history
            await saveToHistory(domain, result);

            // Update UI
            resultsDiv.innerHTML = `
                <div class="domain-name">
                    ${domain}
                </div>
                
                <div class="record-container">
                    <div class="record-label">
                        <span class="status-indicator ${result.dmarc ? 'status-success' : 'status-error'}"></span>
                        DMARC Record
                    </div>
                    <div class="record-value">
                        ${result.dmarc || "No DMARC record found"}
                    </div>
                </div>

                <div class="record-container">
                    <div class="record-label">
                        <span class="status-indicator ${result.spf ? 'status-success' : 'status-error'}"></span>
                        SPF Record
                    </div>
                    <div class="record-value">
                        ${result.spf || "No SPF record found"}
                    </div>
                </div>
            `;
        }).catch(error => {
            const resultsDiv = document.getElementById("results");
            resultsDiv.innerHTML = `
                <div class="record-container" style="color: #e74c3c">
                    Error checking DNS records: ${error.message}
                </div>
            `;
        });
    });
});