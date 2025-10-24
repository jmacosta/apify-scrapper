import { chromium } from 'playwright';

const selectors = {
    row: 'table#myTablaBusquedaCustom > tbody > tr',
    title: 'td:first-child > div:not(.cell-order)',
    link: 'td:first-child a[target="_blank"]',
    date: 'td:nth-child(5)',
    type: 'td:nth-child(2)',
    status: 'td:nth-child(3)',
    budget: 'td:nth-child(4)',
    nextPageButton: 'input[name="viewns_Z7_AVEQAI930OBRD02JPMTPG21004_:form1:footerSiguiente"]',
};

const startUrl = 'https://contrataciondelestado.es/wps/portal/plataforma/buscadores/busqueda/!ut/p/z1/jY9LT8MwEIR_C4dcvVvnARzTPF0VNRCcNL5UbgnIKK5DHvx-DOq1oXub1TczuyBgD-Isv9WHnJQ5y87qRgQHL9lFUZpTfCjdGOk25jzIrcx8qP8A3428alMVQckyRJan8ZavfMxoAOIWP16ZEG_zLwBiOb4GsVxBL8DSi_-VNPbI-0NYJc8he3Rxt36xFZvi6bXI6ArRg_I342Q0UUdN3uWpHUlvhqlrJ1KxpGYxNA5-jr2Dx3n8mts36WBqBj13clBmfdkRS0CvOd-jKrQO734AYHmecg!!/dz/d5/L2dBISEvZ0FBIS9nQSEh/p0/IZ7_AVEQAI930OBRD02JPMTPG21004=CZ6_4EOCCFH208S3D02LDUU6HH20G5=LA0=Ecom.ibm.faces.portlet.VIEWID!QCPjspQCPbusquedaQCPFormularioBusqueda.jsp==/#Z7_AVEQAI930OBRD02JPMTPG21004';

async function extractPageData(page) {
    const rows = await page.$$(selectors.row);
    const results = [];

    for (const row of rows) {
        const titleEl = await row.$(selectors.title);
        const linkEl = await row.$(selectors.link);
        const dateEl = await row.$(selectors.date);
        const typeEl = await row.$(selectors.type);
        const statusEl = await row.$(selectors.status);
        const budgetEl = await row.$(selectors.budget);

        results.push({
            title: titleEl ? await titleEl.innerText() : null,
            link: linkEl ? await linkEl.getAttribute('href') : null,
            date: dateEl ? await dateEl.innerText() : null,
            type: typeEl ? await typeEl.innerText() : null,
            status: statusEl ? await statusEl.innerText() : null,
            budget: budgetEl ? await budgetEl.innerText() : null,
        });
    }

    return results;
}

async function crawl() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(startUrl, { waitUntil: 'load' });

    let hasNextPage = true;
    const allResults = [];

    while (hasNextPage) {
        const pageResults = await extractPageData(page);
        allResults.push(...pageResults);

        // Revisamos si hay siguiente página
        const nextBtn = await page.$(selectors.nextPageButton);
        if (nextBtn) {
            const isDisabled = await nextBtn.isDisabled();
            if (!isDisabled) {
                await Promise.all([
                    page.waitForNavigation({ waitUntil: 'load' }),
                    nextBtn.click(),
                ]);
            } else {
                hasNextPage = false;
            }
        } else {
            hasNextPage = false;
        }
    }

    console.log(allResults);
    await browser.close();
}

crawl().catch(err => {
    console.error('Error en el crawler:', err);
});
