/**
 *
 *
 * @author: Bernhard Lukassen
 * @licence: MIT
 * @see: {@link https://github.com/Thoregon}
 */

import account                from "/etc/account.mjs";
import AffiliateActionManager from "/upayme-module-affiliate-action-manager/affiliateactionmanager.mjs"

globalThis.universe = { account }

const restService = {
    async record(eventlog) {
        try {
            const service = universe.SA_REST ?? '';
            // todo [**REMOTE**]
            const res = await fetch(service + '/xactivity/record?p=' + encodeURIComponent(JSON.stringify(eventlog)));
            console.log(">> Activity.record");
            return res.ok;
        } catch (e) {
            console.error(e);
        }
    }
}

async function handleActivity() {
    console.log(">> handleActivity 1");

    // Get the query string portion of the URL
    const url = new URL(window.location.href);
    // Parse the query string into key-value pairs
    const urlParams = new URLSearchParams(url.search);

    const params = {
        productid: urlParams.get('productid'),
        affiliateid: urlParams.get('affiliateid'),
        campaignkey: urlParams.get('campaignkey'),
    }

    const targetURL = urlParams.get('target');

    console.log(">> handleActivity 2");
    const affiliateManager = AffiliateActionManager.withService(restService);
    const affData = {
        productid  : params.productid,
        affiliate  : params.affiliateid.trim().toLowerCase(),
        campaignkey: params.campaignkey
    }

    // todo [OPEN]: check existing (reggistered) affiliates

    console.log(">> handleActivity 3");
    await affiliateManager.recordClick(affData);

    console.log(">> handleActivity 4");
    // setTimeout(() => window.top.location.href = targetURL, 300);
}

(async () => await handleActivity())();
