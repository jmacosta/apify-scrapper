


import { PlaywrightCrawler, Dataset, log } from 'apify';

const START_URL = 'https://contrataciondelestado.es/wps/myportal/plataforma/buscadores/busqueda';

const crawler = new PlaywrightCrawler({
    launchContext: {
        launchOptions: {
            headless: true, // Cambiar a false si quieres ver el navegador
        },
    },
    maxRequestsPerCrawl: 1000,
    requestHandler: async ({ page, request, enqueueLinks, log }) => {
        log.info(`Procesando página: ${request.url}`);

        // Esperamos a que la tabla cargue
        await page.waitForSelector('table#myTablaBusquedaCustom > tbody > tr');

        // Extraemos las filas
        const rows = await page.$$('table#myTablaBusquedaCustom > tbody > tr');

        for (const row of rows) {
            const title = await row.$eval('td:first-child > div:not(.cell-order)', el => el.textContent.trim());
            const link = await row.$eval('td:first-child a[target="_blank"]', el => el.href);
            const tipo = await row.$eval('td:nth-child(2)', el => el.textContent.trim());
            const estado = await row.$eval('td:nth-child(3)', el => el.textContent.trim());
            const presupuesto = await row.$eval('td:nth-child(4)', el => el.textContent.trim());
            const fecha = await row.$eval('td:nth-child(5)', el => el.textContent.trim());

            await Dataset.pushData({
                title,
                link,
                tipo,
                estado,
                presupuesto,
                fecha,
            });
        }

        // Paginar: buscamos botón "Siguiente" habilitado
        const nextBtn = await page.$('input[name="viewns_Z7_AVEQAI930OBRD02JPMTPG21004_:form1:footerSiguiente"]:not([disabled])');
        if (nextBtn) {
            log.info('Pasando a la siguiente página...');
            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle' }),
                nextBtn.click(),
            ]);
            // Reprocesamos la misma página para la siguiente iteración
            return request.queue.addRequest({ url: request.url });
        } else {
            log.info('No hay más páginas.');
        }
    },
});

await crawler.run([START_URL]);
log.info('Crawler finalizado.');
