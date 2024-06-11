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
            const res = await fetch(service + '/xactivity/record?p=' + encodeURIComponent(JSON.stringify(eventlog)));
            return res.ok;
        } catch (e) {
            console.error(e);
        }
    }
}

async function handleActivity() {
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

    const affiliateManager = AffiliateActionManager.withService(restService);
    const affData = {
        productid  : params.productid,
        affiliate  : params.affiliateid.trim().toLowerCase(),
        campaignkey: params.campaignkey
    }

    await affiliateManager.recordClick(affData);

    debugger;
    setTimeout(() => window.top.location.href = targetURL, 300);


}
debugger;
(async () => await handleActivity())();
