chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        const domain = new URL(tab.url).hostname;

        checkDNSRecords(domain).then((result) => {
            console.log("DMARC:", result.dmarc);
            console.log("SPF:", result.spf);

            chrome.action.setBadgeText({
                tabId: tabId,
                text: result.dmarc || result.spf ? "OK" : "!",
            });
        });
    }
});

async function checkDNSRecords(domain) {
    const dnsApiUrl = `https://dns.google/resolve?name=${domain}&type=TXT`;

    try {
        const response = await fetch(dnsApiUrl);
        const data = await response.json();

        const dmarc = data.Answer?.find((record) =>
            record.data.includes("v=DMARC1")
        );
        const spf = data.Answer?.find((record) =>
            record.data.includes("v=spf1")
        );

        return {
            dmarc: dmarc ? dmarc.data : null,
            spf: spf ? spf.data : null,
        };
    } catch (error) {
        console.error("Error fetching DNS records:", error);
        return { dmarc: null, spf: null };
    }
}
